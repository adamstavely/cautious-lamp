import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DocumentStore, TEAM_STORE, VersionConflictError } from './document-store';
import { AddMemberDto, CreateTeamDto, UpdateMemberDto, UpdateTeamDto } from './review.dto';
import { isSafeId, newId } from './review-files.service';
import { Team, TeamMember } from './review.types';

const MAX_WRITE_ATTEMPTS = 5;

@Injectable()
export class TeamsService {
  constructor(@Inject(TEAM_STORE) private readonly store: DocumentStore<Team>) {}

  async list(): Promise<Team[]> {
    return this.store.list();
  }

  async get(id: string): Promise<Team> {
    const stored = isSafeId(id) ? await this.store.get(id) : null;
    if (!stored) throw new NotFoundException('Team not found');
    return stored.doc;
  }

  async create(dto: CreateTeamDto): Promise<Team> {
    const now = new Date().toISOString();
    const team: Team = {
      id: newId('team'),
      name: dto.name,
      description: dto.description ?? '',
      members: [],
      createdAt: now,
      updatedAt: now,
    };
    await this.store.create(team);
    return team;
  }

  update(id: string, dto: UpdateTeamDto): Promise<Team> {
    return this.mutate(id, (team) => {
      if (dto.name !== undefined) team.name = dto.name;
      if (dto.description !== undefined) team.description = dto.description;
    });
  }

  async delete(id: string): Promise<void> {
    if (!isSafeId(id) || !(await this.store.delete(id))) throw new NotFoundException('Team not found');
  }

  addMember(id: string, dto: AddMemberDto): Promise<Team> {
    return this.mutate(id, (team) => {
      if (findMember(team, dto.email)) throw new ConflictException('That person is already a member');
      team.members.push({ email: dto.email, name: dto.name, role: dto.role });
    });
  }

  updateMember(id: string, email: string, dto: UpdateMemberDto): Promise<Team> {
    return this.mutate(id, (team) => {
      const member = findMember(team, email);
      if (!member) throw new NotFoundException('Member not found');
      member.role = dto.role;
    });
  }

  removeMember(id: string, email: string): Promise<Team> {
    return this.mutate(id, (team) => {
      const member = findMember(team, email);
      if (!member) throw new NotFoundException('Member not found');
      team.members = team.members.filter((m) => m !== member);
    });
  }

  private async mutate(id: string, fn: (team: Team) => void): Promise<Team> {
    if (!isSafeId(id)) throw new NotFoundException('Team not found');
    for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt++) {
      const stored = await this.store.get(id);
      if (!stored) throw new NotFoundException('Team not found');
      const team = stored.doc;
      team.members = team.members ?? [];
      fn(team);
      team.updatedAt = new Date().toISOString();
      try {
        await this.store.replace(team, stored.version);
        return team;
      } catch (error) {
        if (!(error instanceof VersionConflictError)) throw error;
      }
    }
    throw new ConflictException('The team was changed by someone else at the same time, please try again');
  }
}

function findMember(team: Team, email: string): TeamMember | undefined {
  const target = (email ?? '').trim().toLowerCase();
  return team.members.find((m) => m.email.toLowerCase() === target);
}
