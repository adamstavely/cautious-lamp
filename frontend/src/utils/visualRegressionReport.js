// Visual regression results: the filters and sorts of the results page, and
// the PDF report of one run (an Argos build), drawn with jsPDF in the browser.
import jsPDF from 'jspdf';

export const RESULT_STATUS_LABELS = { passed: 'Passed', failed: 'Changed', new: 'New', removed: 'Removed' };

/** Argos's build statuses, for people */
export const ARGOS_STATUS_LABELS = {
  'no-changes': 'No changes',
  'changes-detected': 'Changes to review',
  accepted: 'Accepted',
  rejected: 'Rejected',
  pending: 'Waiting for screenshots',
  progress: 'Comparing',
  error: 'Error',
  aborted: 'Aborted',
  expired: 'Expired',
};

const startOfDay = (value) => (value ? Date.parse(`${value}T00:00:00`) : NaN);
const endOfDay = (value) => (value ? Date.parse(`${value}T23:59:59.999`) : NaN);

/**
 * Results matching the status (`all` or a result status), the search text and
 * the review date range (YYYY-MM-DD, local days, both ends included). With a
 * date range, results that haven't been reviewed don't match.
 */
export function filterResults(results, { status = 'all', query = '', reviewedFrom = '', reviewedTo = '' } = {}) {
  const text = query.trim().toLowerCase();
  const from = startOfDay(reviewedFrom);
  const to = endOfDay(reviewedTo);
  const byDate = !Number.isNaN(from) || !Number.isNaN(to);
  return results.filter((result) => {
    if (status !== 'all' && result.status !== status) return false;
    if (text && !(result.testName || '').toLowerCase().includes(text)) return false;
    if (byDate) {
      const reviewed = result.approvedAt ? Date.parse(result.approvedAt) : NaN;
      if (Number.isNaN(reviewed)) return false;
      if (!Number.isNaN(from) && reviewed < from) return false;
      if (!Number.isNaN(to) && reviewed > to) return false;
    }
    return true;
  });
}

/** Sorted copy: by `name`, `status` or `reviewed` (review date; unreviewed results last either way) */
export function sortResults(results, sortBy = 'name', order = 'asc') {
  const direction = order === 'desc' ? -1 : 1;
  return [...results].sort((a, b) => {
    if (sortBy === 'reviewed') {
      const ta = a.approvedAt ? Date.parse(a.approvedAt) : NaN;
      const tb = b.approvedAt ? Date.parse(b.approvedAt) : NaN;
      if (Number.isNaN(ta) || Number.isNaN(tb)) {
        if (Number.isNaN(ta) && Number.isNaN(tb)) return (a.testName || '').localeCompare(b.testName || '');
        return Number.isNaN(ta) ? 1 : -1;
      }
      return (ta - tb) * direction;
    }
    const key = sortBy === 'status' ? 'status' : 'testName';
    const compared = (a[key] || '').localeCompare(b[key] || '');
    return (compared || (a.testName || '').localeCompare(b.testName || '')) * direction;
  });
}

const formatDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString();
};

/**
 * The PDF report of a run: what was built, the screenshot counts, and every
 * result with its status and review. Returns the jsPDF document.
 */
export function buildRunReportPdf({ project, run, results, generatedAt = new Date() }) {
  const doc = new jsPDF();
  const margin = 18;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const width = pageWidth - margin * 2;
  let y = margin;

  const ensureRoom = (needed) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };
  const line = (text, { size = 10, bold = false, gap = 2 } = {}) => {
    doc.setFontSize(size);
    doc.setFont(undefined, bold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(String(text), width);
    const height = lines.length * size * 0.45;
    ensureRoom(height);
    doc.text(lines, margin, y);
    y += height + gap;
  };

  line('Visual regression report', { size: 18, bold: true, gap: 4 });
  line(`Project: ${project?.name ?? run.projectId}`, { size: 12, bold: true });
  if (project?.argosProjectId) line(`Argos project: ${project.argosProjectId}`);
  line(`Generated: ${formatDateTime(generatedAt)}`, { gap: 6 });

  line('Build', { size: 13, bold: true });
  if (run.argosBuildNumber !== undefined) line(`Argos build #${run.argosBuildNumber}`);
  line(`Status: ${ARGOS_STATUS_LABELS[run.argosStatus] ?? run.status}`);
  if (run.branch) line(`Branch: ${run.branch}`);
  if (run.commitSha) line(`Commit: ${run.commitSha}`);
  if (run.startedAt) line(`Started: ${formatDateTime(run.startedAt)}`);
  if (run.argosUrl) line(`In Argos: ${run.argosUrl}`);
  y += 4;

  const summary = run.resultsSummary;
  line('Screenshots', { size: 13, bold: true });
  if (summary) {
    line(`${summary.total} compared: ${summary.passed} passed, ${summary.failed} changed, ${summary.new} new, ${summary.removed} removed`);
  } else {
    line('Argos has not reported this build’s screenshots yet.');
  }
  const reviewed = results.filter((r) => r.approvedAt);
  line(`${reviewed.length} reviewed here`, { gap: 6 });

  line('Results', { size: 13, bold: true });
  if (results.length === 0) line('No results.');
  for (const result of results) {
    const review = result.approvedAt
      ? `${result.approved ? 'approved' : 'changes requested'} ${formatDateTime(result.approvedAt)}`
      : result.approved
        ? 'accepted'
        : 'not reviewed';
    line(`${result.testName} — ${RESULT_STATUS_LABELS[result.status] ?? result.status}, ${review}`, { gap: 1 });
  }
  return doc;
}
