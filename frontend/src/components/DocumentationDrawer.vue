<template>
  <!-- Drawer - slides in/out from left, positioned next to sidebar -->
  <!-- When closed, show a small toggle button -->
  <div 
    v-if="!isOpen" 
    class="drawer-rail"
  >
    <button
      @click="toggle"
      class="drawer-icon-btn"
      title="Open drawer"
      aria-label="Open drawer"
    >
      <AppIcon name="menu" />
    </button>
  </div>
  
  <!-- Drawer - when open -->
  <div 
    v-if="isOpen"
    class="drawer-panel"
  >
    <!-- Drawer Content -->
    <div class="p-6">
      <!-- Foundations - only show when not on patterns route -->
      <div v-if="showMainSections" class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="drawer-heading">Foundations</h3>
          <button
            @click="toggle"
            class="drawer-icon-btn"
            title="Close drawer"
            aria-label="Close drawer"
          >
            <AppIcon name="panel-left-close" />
          </button>
        </div>
        <nav class="space-y-1">
          <button
            v-for="item in filteredFoundations"
            :key="item.link"
            @click="navigateToDoc(item.link)"
            class="drawer-item"
          >
            <AppIcon :name="item.icon" class="text-lg" />
            <span class="font-medium">{{ item.text }}</span>
          </button>
        </nav>
      </div>
      
      <!-- Patterns - only show when on patterns route -->
      <div v-if="showPatterns" class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="drawer-heading">Patterns</h3>
          <button
            @click="toggle"
            class="drawer-icon-btn"
            title="Close drawer"
            aria-label="Close drawer"
          >
            <AppIcon name="panel-left-close" />
          </button>
        </div>
        <nav class="space-y-6">
          <!-- Overview -->
          <div class="space-y-1">
            <router-link
              to="/patterns"
              class="drawer-item"
              :class="{ 'drawer-item-on': isActive('/patterns') && route.path === '/patterns' }"
            >
              <AppIcon name="layout-dashboard" class="text-lg" />
              <span class="font-medium">Overview</span>
            </router-link>
          </div>

          <!-- Pattern Status -->
          <div class="space-y-1">
            <router-link
              to="/patterns/status"
              class="drawer-item"
              :class="{ 'drawer-item-on': isActive('/patterns/status') }"
            >
              <AppIcon name="circle-check" class="text-lg" />
              <span class="font-medium">Pattern Status</span>
            </router-link>
          </div>

          <!-- Design Patterns -->
          <div>
            <h4 class="drawer-subheading">Design Patterns</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredDesignPatterns"
                :key="item.link"
                :to="item.link"
                class="drawer-item"
                :class="{ 'drawer-item-on': isActive(item.link) }"
              >
                <AppIcon :name="item.icon" class="text-lg" />
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>

          <!-- Interaction Patterns -->
          <div>
            <h4 class="drawer-subheading">Interaction Patterns</h4>
            <div class="space-y-1">
              <a
                v-for="item in filteredInteractionPatterns"
                :key="item.link"
                href="#"
                @click.prevent="navigateToDoc(item.link)"
                class="drawer-item"
                :class="{ 'drawer-item-on': isActive(item.link) }"
              >
                <AppIcon :name="item.icon" class="text-lg" />
                <span class="font-medium">{{ item.text }}</span>
              </a>
            </div>
          </div>

          <!-- Code Patterns -->
          <div>
            <h4 class="drawer-subheading">Code Patterns</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredCodePatterns"
                :key="item.link"
                :to="item.link"
                class="drawer-item"
                :class="{ 'drawer-item-on': isActive(item.link) }"
              >
                <AppIcon :name="item.icon" class="text-lg" />
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>
        </nav>
      </div>
      
      <!-- Components - only show when on components route -->
      <div v-if="showComponents" class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="drawer-heading">Components</h3>
          <button
            @click="toggle"
            class="drawer-icon-btn"
            title="Close drawer"
            aria-label="Close drawer"
          >
            <AppIcon name="panel-left-close" />
          </button>
        </div>
        <nav class="space-y-6">
          <!-- Overview -->
            <div class="space-y-1">
              <router-link
                to="/components"
                class="drawer-item"
                :class="{ 'drawer-item-on': isActive('/components') }"
              >
                <AppIcon name="blocks" class="text-lg" />
                <span class="font-medium">Overview</span>
              </router-link>
          </div>

          <!-- Utilities -->
          <div>
            <h4 class="drawer-subheading">Utilities</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredComponentUtilities"
                :key="item.link"
                :to="item.link"
                class="drawer-item"
                :class="{ 'drawer-item-on': isActive(item.link) }"
              >
                <ScanEye v-if="item.icon === 'scan-eye'" :size="20" :stroke-width="2" />
                <AppIcon :name="item.icon" v-else class="text-lg" />
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>

          <!-- Components -->
          <div>
            <h4 class="drawer-subheading">Components</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredComponentItems"
                :key="item.link"
                :to="item.link"
                class="drawer-item"
                :class="{ 'drawer-item-on': isActive(item.link) }"
              >
                <Pipette v-if="item.icon === 'pipette'" :size="20" :stroke-width="2" />
                <Captions v-else-if="item.icon === 'captions'" :size="20" :stroke-width="2" />
                <AppIcon :name="item.icon" v-else class="text-lg" />
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>
        </nav>
      </div>
      
      <!-- Getting Started - only show when on getting started route -->
      <div v-if="showGettingStarted" class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="drawer-heading">Getting Started</h3>
          <button
            @click="toggle"
            class="drawer-icon-btn"
            title="Close drawer"
            aria-label="Close drawer"
          >
            <AppIcon name="panel-left-close" />
          </button>
        </div>
        <nav class="space-y-6">
          <!-- Overview -->
          <div class="space-y-1">
            <router-link
              v-for="item in filteredGettingStartedBasics.filter(item => item.link === '/getting-started')"
              :key="item.link"
              :to="item.link"
              class="drawer-item"
              :class="{ 'drawer-item-on': isActive(item.link) }"
            >
              <AppIcon :name="item.icon" class="text-lg" />
              <span class="font-medium">{{ item.text }}</span>
            </router-link>
          </div>

          <!-- About -->
          <div>
            <h4 class="drawer-subheading">About</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredGettingStartedBasics.filter(item => item.link !== '/getting-started')"
                :key="item.link"
                :to="item.link"
                class="drawer-item"
                :class="{ 'drawer-item-on': isActive(item.link) }"
              >
                <AppIcon :name="item.icon" class="text-lg" />
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>

          <!-- Design Principles -->
          <div>
            <h4 class="drawer-subheading">Design Principles</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredGettingStartedPrinciples"
                :key="item.link"
                :to="item.link"
                class="drawer-item"
                :class="{ 'drawer-item-on': isActive(item.link) }"
              >
                <AppIcon :name="item.icon" class="text-lg" />
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>

          <!-- Setup & Installation -->
          <div>
            <h4 class="drawer-subheading">Setup & Installation</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredGettingStartedSetup"
                :key="item.link"
                :to="item.link"
                class="drawer-item"
                :class="{ 'drawer-item-on': isActive(item.link) }"
              >
                <AppIcon :name="item.icon" class="text-lg" />
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>

          <!-- Foundations -->
          <div>
            <h4 class="drawer-subheading">Foundations</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredGettingStartedFoundations"
                :key="item.link"
                :to="item.link"
                class="drawer-item"
                :class="{ 'drawer-item-on': isActive(item.link) }"
              >
                <AppIcon :name="item.icon" class="text-lg" />
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>

          <!-- Resources & Support -->
          <div>
            <h4 class="drawer-subheading">Resources & Support</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredGettingStartedResources"
                :key="item.link"
                :to="item.link"
                class="drawer-item"
                :class="{ 'drawer-item-on': isActive(item.link) }"
              >
                <AppIcon :name="item.icon" class="text-lg" />
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>
        </nav>
      </div>
      
      <!-- Tools - only show when on tools route -->
      <div v-if="showTools" class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="drawer-heading">Tools</h3>
          <button
            @click="toggle"
            class="drawer-icon-btn"
            title="Close drawer"
            aria-label="Close drawer"
          >
            <AppIcon name="panel-left-close" />
          </button>
        </div>
        <nav class="space-y-6">
          <!-- Overview -->
            <div class="space-y-1">
              <router-link
                v-for="item in filteredToolGroups.overview"
                :key="item.link"
                :to="item.link"
                class="drawer-item"
                :class="{ 'drawer-item-on': isActive(item.link) }"
              >
                <AppIcon :name="item.icon" class="text-lg" />
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
          </div>

          <!-- Color -->
          <div>
            <h4 class="drawer-subheading">Color</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredToolGroups.color"
                :key="item.link"
                :to="item.link"
                class="drawer-item"
                :class="{ 'drawer-item-on': isActive(item.link) }"
              >
                <SwatchBook v-if="item.icon === 'swatch-book'" :size="20" :stroke-width="2" />
                <AppIcon :name="item.icon" v-else class="text-lg" />
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>

          <!-- Text & Content -->
          <div>
            <h4 class="drawer-subheading">Text & Content</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredToolGroups.text"
                :key="item.link"
                :to="item.link"
                class="drawer-item"
                :class="{ 'drawer-item-on': isActive(item.link) }"
              >
                <TextInitial v-if="item.icon === 'text-initial'" :size="20" :stroke-width="2" />
                <Tag v-else-if="item.icon === 'tag'" :size="20" :stroke-width="2" />
                <AppIcon :name="item.icon" v-else class="text-lg" />
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>

          <!-- Development -->
          <div v-if="filteredToolGroups.development.length > 0">
            <h4 class="drawer-subheading">Development</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredToolGroups.development"
                :key="item.link"
                :to="item.link"
                class="drawer-item"
                :class="{ 'drawer-item-on': isActive(item.link) }"
              >
                <AppIcon :name="item.icon" class="text-lg" />
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>

          <!-- Image & Video -->
          <div>
            <h4 class="drawer-subheading">Image & Video</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredToolGroups.image"
                :key="item.link"
                :to="item.link"
                class="drawer-item"
                :class="{ 'drawer-item-on': isActive(item.link) }"
              >
                <Captions v-if="item.icon === 'captions'" :size="20" :stroke-width="2" />
                <AppIcon :name="item.icon" v-else class="text-lg" />
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>

          <!-- References -->
          <div v-if="filteredToolGroups.references && filteredToolGroups.references.length > 0">
            <h4 class="drawer-subheading">References</h4>
            <div class="space-y-1">
              <a
                v-for="item in filteredToolGroups.references"
                :key="item.link"
                href="#"
                @click.prevent="navigateToDoc(item.link)"
                class="drawer-item"
                :class="{ 'drawer-item-on': isActive(item.link) }"
              >
                <AppIcon :name="item.icon" class="text-lg" />
                <span class="font-medium">{{ item.text }}</span>
              </a>
            </div>
          </div>
        </nav>
      </div>
      
      <!-- Data Viz - only show when on data-viz route -->
      <div v-if="showDataViz" class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="drawer-heading">Data Visualization</h3>
          <button
            @click="toggle"
            class="drawer-icon-btn"
            title="Close drawer"
            aria-label="Close drawer"
          >
            <AppIcon name="panel-left-close" />
          </button>
        </div>
        <nav class="space-y-6">
          <!-- Overview -->
          <div class="space-y-1">
            <router-link
              to="/data-viz"
              class="drawer-item"
              :class="{ 'drawer-item-on': isActive('/data-viz') && route.path === '/data-viz' }"
            >
              <AppIcon name="chart-column" class="text-lg" />
              <span class="font-medium">Overview</span>
            </router-link>
          </div>
          
          <!-- Guidance -->
          <div>
            <h4 class="drawer-subheading">Guidance</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredDataVizGuidance"
                :key="item.link"
                :to="item.link"
                class="drawer-item"
                :class="{ 'drawer-item-on': isActive(item.link) }"
              >
                <AppIcon :name="item.icon" class="text-lg" />
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>

          <!-- Generators -->
          <div>
            <h4 class="drawer-subheading">Generators</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredDataVizGenerators"
                :key="item.link"
                :to="item.link"
                class="drawer-item"
                :class="{ 'drawer-item-on': isActive(item.link) }"
              >
                <AppIcon :name="item.icon" class="text-lg" />
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>

          <!-- Utilities -->
          <div>
            <h4 class="drawer-subheading">Utilities</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredDataVizUtilities"
                :key="item.link"
                :to="item.link"
                class="drawer-item"
                :class="{ 'drawer-item-on': isActive(item.link) }"
              >
                <AppIcon :name="item.icon" class="text-lg" />
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>
        </nav>
      </div>
      
      <!-- Review - only show when on review route -->
      <div v-if="showReview" class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="drawer-heading">Review</h3>
          <button
            @click="toggle"
            class="drawer-icon-btn"
            title="Close drawer"
            aria-label="Close drawer"
          >
            <AppIcon name="panel-left-close" />
          </button>
        </div>
        <nav class="space-y-1">
          <router-link
            v-for="item in filteredReviewItems"
            :key="item.link"
            :to="item.link"
            class="drawer-item"
            :class="{ 'drawer-item-on': isActive(item.link) }"
          >
            <FolderKanban v-if="item.icon === 'folder-kanban'" :size="20" :stroke-width="2" />
            <AppIcon :name="item.icon" v-else class="text-lg" />
            <span class="font-medium">{{ item.text }}</span>
          </router-link>
        </nav>

        <!-- Utilities -->
        <div class="mt-6">
          <h4 class="drawer-subheading">Utilities</h4>
          <nav class="space-y-1">
            <router-link
              v-for="item in filteredReviewUtilities"
              :key="item.link"
              :to="item.link"
              class="drawer-item"
              :class="{ 'drawer-item-on': isActive(item.link) }"
            >
              <AppIcon :name="item.icon" class="text-lg" />
              <span class="font-medium">{{ item.text }}</span>
            </router-link>
          </nav>
        </div>
      </div>
      
      <!-- HCD - only show when on research route -->
      <div v-if="showResearch" class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="drawer-heading normal-case">Human-Centered Design</h3>
          <button
            @click="toggle"
            class="drawer-icon-btn"
            title="Close drawer"
            aria-label="Close drawer"
          >
            <AppIcon name="panel-left-close" />
          </button>
        </div>
        <nav class="space-y-6">
          <!-- HCD Overview -->
          <div class="space-y-1">
            <router-link
              to="/hcd"
              class="drawer-item"
              :class="{ 'drawer-item-on': route.path === '/hcd' }"
            >
              <AppIcon name="notebook-tabs" class="text-lg" />
              <span class="font-medium">Overview</span>
            </router-link>
          </div>
          
          <!-- HCD Guidelines -->
          <div>
            <h4 class="drawer-subheading">HCD Guidelines</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredHumanCenteredDesign"
                :key="item.link"
                :to="item.link"
                class="drawer-item"
                :class="{ 'drawer-item-on': isActive(item.link) }"
              >
                <AppIcon :name="item.icon" class="text-lg" />
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>

          <!-- Research Artifacts -->
          <div>
            <h4 class="drawer-subheading">Research Artifacts</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredResearchArtifacts"
                :key="item.link"
                :to="item.link"
                class="drawer-item"
                :class="{ 'drawer-item-on': isActive(item.link) }"
              >
                <AppIcon :name="item.icon" class="text-lg" />
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>

          <!-- UX Research Tools -->
          <div>
            <h4 class="drawer-subheading">UX Research Tools</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredUxResearchTools"
                :key="item.link"
                :to="item.link"
                class="drawer-item"
                :class="{ 'drawer-item-on': isActive(item.link) }"
              >
                <AppIcon :name="item.icon" class="text-lg" />
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>
        </nav>
      </div>
      
      <!-- Guidelines - only show when on guidelines route -->
      <div v-if="showGuidelines" class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="drawer-heading">Foundations</h3>
          <button
            @click="toggle"
            class="drawer-icon-btn"
            title="Close drawer"
            aria-label="Close drawer"
          >
            <AppIcon name="panel-left-close" />
          </button>
        </div>
        <nav class="space-y-6">
          <!-- Guidelines Overview -->
          <div class="space-y-1">
            <router-link
              to="/guidelines"
              class="drawer-item"
              :class="{ 'drawer-item-on': isActive('/guidelines') && route.path === '/guidelines' }"
            >
              <AppIcon name="book-open" class="text-lg" />
              <span class="font-medium">Overview</span>
            </router-link>
          </div>
          
          <!-- Foundations -->
          <div>
            <h4 class="drawer-subheading">Foundations</h4>
            <div class="space-y-1">
              <a
                v-for="item in filteredFoundations"
                :key="item.link"
                href="#"
                @click.prevent="navigateToDoc(item.link)"
                class="drawer-item"
                :class="{ 'drawer-item-on': isActive(item.link) }"
              >
                <AppIcon :name="item.icon" class="text-lg" />
                <span class="font-medium">{{ item.text }}</span>
              </a>
              <a
                v-for="item in filteredGuidelines.filter(item => {
                  const isFoundation = foundations.some((foundation) => foundation.link === item.link);
                  const isGuidelinePage = item.link.startsWith('/guidelines/') && 
                    !item.link.startsWith('/guidelines/ai/') && 
                    !item.link.startsWith('/guidelines/patterns/') && 
                    !item.link.startsWith('/guidelines/tools/') &&
                    item.link !== '/guidelines/voice-and-tone' &&
                    item.link !== '/guidelines/tui-guidance';
                  return !isFoundation && (isGuidelinePage || item.link === '/guidelines/voice-and-tone' || item.link === '/guidelines/tui-guidance');
                })"
                :key="item.link"
                href="#"
                @click.prevent="navigateToDoc(item.link)"
                class="drawer-item"
                :class="{ 'drawer-item-on': isActive(item.link) }"
              >
                <AppIcon :name="item.icon" class="text-lg" />
                <span class="font-medium">{{ item.text }}</span>
              </a>
            </div>
          </div>
          
          <!-- Artificial Intelligence -->
          <div>
            <h4 class="drawer-subheading">Artificial Intelligence</h4>
            <div class="space-y-1">
              <a
                v-for="item in filteredArtificialIntelligence.filter(item => item.link.startsWith('/guidelines/ai/'))"
                :key="item.link"
                href="#"
                @click.prevent="navigateToDoc(item.link)"
                class="drawer-item"
                :class="{ 'drawer-item-on': isActive(item.link) }"
              >
                <AppIcon :name="item.icon" class="text-lg" />
                <span class="font-medium">{{ item.text }}</span>
              </a>
            </div>
          </div>
        </nav>
      </div>
      
      <!-- Design Assets - only show when on design assets route -->
      <div v-if="showDesignAssets" class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="drawer-heading">Design Assets</h3>
          <button
            @click="toggle"
            class="drawer-icon-btn"
            title="Close drawer"
            aria-label="Close drawer"
          >
            <AppIcon name="panel-left-close" />
          </button>
        </div>
        <nav class="space-y-6">
          <!-- Overview -->
          <div class="space-y-1">
            <router-link
              v-for="item in filteredDesignAssets.filter(item => item.link === '/design-assets')"
              :key="item.link"
              :to="item.link"
              class="drawer-item"
              :class="{ 'drawer-item-on': isActive(item.link) }"
            >
              <AppIcon :name="item.icon" class="text-lg" />
              <span class="font-medium">{{ item.text }}</span>
            </router-link>
          </div>
          
          <!-- Icons & Fonts -->
          <div>
            <h4 class="drawer-subheading">Icons & Fonts</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredDesignAssets.filter(item => item.link === '/design-assets/icons' || item.link === '/design-assets/font-library' || item.link === '/design-assets/country-flags')"
                :key="item.link"
                :to="item.link"
                class="drawer-item"
                :class="{ 'drawer-item-on': isActive(item.link) }"
              >
                <AppIcon :name="item.icon" class="text-lg" />
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>

          <!-- Seals & Logos -->
          <div>
            <h4 class="drawer-subheading">Seals & Logos</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredDesignAssets.filter(item => item.link === '/design-assets/company-logos' || item.link === '/design-assets/capability-logos' || item.link === '/design-assets/internal-seals' || item.link === '/design-assets/usg-seals')"
                :key="item.link"
                :to="item.link"
                class="drawer-item"
                :class="{ 'drawer-item-on': isActive(item.link) }"
              >
                <AppIcon :name="item.icon" class="text-lg" />
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>

          <!-- Visuals -->
          <div>
            <h4 class="drawer-subheading">Visuals</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredDesignAssets.filter(item => item.link === '/design-assets/illustrations' || item.link === '/design-assets/interactives' || item.link === '/design-assets/stock-photos')"
                :key="item.link"
                :to="item.link"
                class="drawer-item"
                :class="{ 'drawer-item-on': isActive(item.link) }"
              >
                <AppIcon :name="item.icon" class="text-lg" />
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>
        </nav>
      </div>
      
      <!-- Admin - only show when on admin route -->
      <div v-if="showAdmin" class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="drawer-heading">Admin</h3>
          <button
            @click="toggle"
            class="drawer-icon-btn"
            title="Close drawer"
            aria-label="Close drawer"
          >
            <AppIcon name="panel-left-close" />
          </button>
        </div>
        <nav class="space-y-1">
          <router-link
            v-for="item in filteredAdminItems"
            :key="item.link"
            :to="item.link"
            class="drawer-item"
            :class="{ 'drawer-item-on': isActive(item.link) }"
          >
            <AppIcon :name="item.icon" class="text-lg" />
            <span class="font-medium">{{ item.text }}</span>
          </router-link>
        </nav>
      </div>
      
      <!-- Tokens - only show when on tokens route -->
      <div v-if="showTokens" class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="drawer-heading">Tokens</h3>
          <button
            @click="toggle"
            class="drawer-icon-btn"
            title="Close drawer"
            aria-label="Close drawer"
          >
            <AppIcon name="panel-left-close" />
          </button>
        </div>
        <nav class="space-y-6">
          <!-- Overview -->
          <div class="space-y-1">
            <router-link
              v-for="item in filteredTokenItems.filter(item => item.link === '/tokens')"
              :key="item.link"
              :to="item.link"
              class="drawer-item"
              :class="{ 'drawer-item-on': isActive(item.link) }"
            >
              <AppIcon :name="item.icon" class="text-lg" />
              <span class="font-medium">{{ item.text }}</span>
            </router-link>
          </div>

          <!-- Studio -->
          <div>
            <h4 class="drawer-subheading">Studio</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredTokenItems.filter(item => item.link === '/tokens/studio' || item.link === '/tokens/ai-builder' || item.link === '/tokens/playground')"
                :key="item.link"
                :to="item.link"
                class="drawer-item"
                :class="{ 'drawer-item-on': isActive(item.link) }"
              >
                <AppIcon :name="item.icon" class="text-lg" />
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>

          <!-- Library -->
          <div>
            <h4 class="drawer-subheading">Library</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredTokenItems.filter(item => item.link === '/tokens/library' || item.link === '/tokens/color-palettes')"
                :key="item.link"
                :to="item.link"
                class="drawer-item"
                :class="{ 'drawer-item-on': isActive(item.link) }"
              >
                <AppIcon :name="item.icon" class="text-lg" />
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>

          <!-- Utilities -->
          <div>
            <h4 class="drawer-subheading">Utilities</h4>
            <nav class="space-y-1">
              <router-link
                v-for="item in filteredTokenUtilities"
                :key="item.link"
                :to="item.link"
                class="drawer-item"
                :class="{ 'drawer-item-on': isActive(item.link) }"
              >
                <AppIcon :name="item.icon" class="text-lg" />
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </nav>
          </div>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, computed } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { Pipette, ScanEye, Captions, Tag, TextInitial, SwatchBook, FolderKanban } from 'lucide-vue-next';
import { getFeatureFlagForRoute } from '../router/featureFlagGuards';
import { flagCache, getUserContext } from '../composables/useFeatureFlags';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'toggle', 'navigate-doc']);

const route = useRoute();
const router = useRouter();

const close = () => {
  emit('close');
};

const toggle = () => {
  emit('toggle');
};

const navigateToDoc = (link) => {
  // Handle standalone component routes that should navigate directly
  const standaloneRoutes = ['/guidelines/voice-and-tone', '/guidelines/tui-guidance'];
  if (standaloneRoutes.includes(link)) {
    router.push(link);
    return;
  }
  
  emit('navigate-doc', link);
  // Navigate to appropriate page based on link
  if (link.startsWith('/data-viz/')) {
    if (route.path !== '/data-viz' && !route.path.startsWith('/data-viz/')) {
      router.push('/data-viz');
    }
  } else if (link.startsWith('/tools/references/')) {
    // For reference pages, navigate directly to the specific page
    // This keeps the drawer in Tools mode (showTools will be true)
    router.push(link);
  } else if (link.startsWith('/guidelines/patterns/')) {
    // For pattern pages under /guidelines/patterns/, navigate directly to the specific path
    router.push(link);
  } else if (link.startsWith('/patterns/')) {
    // For pattern pages, navigate directly to the specific path
    router.push(link);
  } else if (link.startsWith('/guidelines/')) {
    // For all other guidelines docs, navigate directly to the specific path
    // This ensures the URL shows the full path and breadcrumbs work correctly
    router.push(link);
  }
  // Don't close the drawer - keep it open
  // The drawer state is managed by the parent component, so we don't emit 'close' here
};

const getDocUrl = (link) => {
  if (import.meta.env.DEV) {
    return `http://localhost:5175/guidelines${link === '/' ? '' : link}`;
  }
  return `/guidelines${link === '/' ? '/index.html' : link}.html`;
};

const foundations = [
  { text: 'Colors', link: '/guidelines/colors', icon: 'palette' },
  { text: 'Typography', link: '/guidelines/typography', icon: 'type' },
  { text: 'Spacing', link: '/guidelines/spacing', icon: 'layout-panel-left' },
  { text: 'Shadows', link: '/guidelines/shadows', icon: 'layers' },
  { text: 'Accessibility', link: '/guidelines/accessibility', icon: 'accessibility' }
];

const artificialIntelligence = [
  { text: 'AI Patterns', link: '/ai/patterns', icon: 'sparkles' },
  { text: 'AI Components', link: '/ai/components', icon: 'bot' },
  { text: 'Agent Roles Mental Models', link: '/guidelines/ai/agent-roles-mental-models', icon: 'brain' },
  { text: 'Content Microcopy', link: '/guidelines/ai/content-microcopy', icon: 'type' },
  { text: 'Designing for Agentic Experiences', link: '/guidelines/ai/designing-for-agentic-experiences', icon: 'sparkles' },
  { text: 'Designing for Generative AI', link: '/guidelines/ai/designing-for-generative-ai', icon: 'bot' },
  { text: 'Designing for MCP UI', link: '/guidelines/ai/designing-for-mcp-ui', icon: 'settings' },
  { text: 'Fallback Error States', link: '/guidelines/ai/fallback-error-states', icon: 'circle-alert' },
  { text: 'Feedback Observability', link: '/guidelines/ai/feedback-observability', icon: 'eye' },
  { text: 'Human Machine Teaming', link: '/guidelines/ai/human-machine-teaming', icon: 'handshake' },
  { text: 'Identity Persona', link: '/guidelines/ai/identity-persona', icon: 'user' },
  { text: 'Memory Personalization', link: '/guidelines/ai/memory-personalization', icon: 'cpu' },
  { text: 'Safe Exploration', link: '/guidelines/ai/safe-exploration', icon: 'compass' }
];

const humanCenteredDesign = [
  { text: 'HCD Principles', link: '/hcd/principles', icon: 'users' },
  { text: 'HCD Process', link: '/hcd/process', icon: 'chart-gantt' },
  { text: 'HCD Council', link: '/hcd/council', icon: 'users-round' },
  { text: 'Research Methods', link: '/hcd/research-methods', icon: 'flask-conical' },
  { text: 'Recruiting Users', link: '/hcd/recruiting-users', icon: 'user-plus' },
  { text: 'Conducting Interviews', link: '/hcd/conducting-interviews', icon: 'speech' },
  { text: 'Laws of UX', link: '/hcd/laws-of-ux', icon: 'list-checks' }
];

const guidelines = [
  { text: 'Voice and Tone', link: '/guidelines/voice-and-tone', icon: 'mic' },
  { text: 'Terminal UI (TUI) Guidance', link: '/guidelines/tui-guidance', icon: 'terminal' },
  { text: 'Color Contrast', link: '/guidelines/color-contrast', icon: 'contrast' },
  { text: 'Content Organization Navigation', link: '/guidelines/content-organization-navigation', icon: 'navigation' },
  { text: 'CSS Grid Layout', link: '/guidelines/css-grid-layout', icon: 'layout-grid' },
  { text: 'Flashing', link: '/guidelines/flashing', icon: 'zap' },
  { text: 'Focus', link: '/guidelines/focus', icon: 'focus' },
  { text: 'Iconography', link: '/guidelines/iconography', icon: 'image' },
  { text: 'Information Architecture', link: '/guidelines/information-architecture', icon: 'network' },
  { text: 'Keyboard Gestures', link: '/guidelines/keyboard-gestures', icon: 'keyboard' },
  { text: 'Metadata SEO', link: '/guidelines/metadata-seo', icon: 'search' },
  { text: 'Multimedia Animation', link: '/guidelines/multimedia-animation', icon: 'wand-sparkles' },
  { text: 'Text Graphics', link: '/guidelines/text-graphics', icon: 'type' },
  { text: 'Time', link: '/guidelines/time', icon: 'clock' }
];

// Design Patterns - core UI patterns
const designPatterns = [
  { text: 'Layout Patterns', link: '/patterns/layout', icon: 'layout-dashboard' },
  { text: 'Navigation', link: '/patterns/navigation', icon: 'navigation' },
  { text: 'Data Display', link: '/patterns/data-display', icon: 'table-2' },
  { text: 'Forms', link: '/patterns/forms', icon: 'file-text' },
  { text: 'Feedback', link: '/patterns/feedback', icon: 'message-square-warning' },
  { text: 'Empty Loading States', link: '/guidelines/patterns/empty-loading-states', icon: 'hourglass' },
  { text: 'Error Handling', link: '/guidelines/patterns/error-handling', icon: 'circle-alert' },
  { text: 'New Features Experiences', link: '/guidelines/patterns/new-features-experiences', icon: 'badge-alert' }
];

// Interaction Patterns - AI and interaction-focused patterns
const interactionPatterns = [
  { text: 'Agent-Oriented Onboarding', link: '/guidelines/patterns/agent-oriented-onboarding', icon: 'rocket' },
  { text: 'AI Disengagement Timeout Error', link: '/guidelines/patterns/ai-disengagement-timeout-error', icon: 'timer-off' },
  { text: 'AI Thinking States', link: '/guidelines/patterns/ai-thinking-states', icon: 'brain' },
  { text: 'Multi-Agent Orchestration', link: '/guidelines/patterns/multi-agent-orchestration', icon: 'network' }
];

const codePatterns = [
  { text: 'Form Validation', link: '/patterns/form-validation', icon: 'file-text' },
  { text: 'Accessible Modal', link: '/patterns/accessible-modal', icon: 'maximize' },
  { text: 'Sortable Data Table', link: '/patterns/sortable-data-table', icon: 'table-2' },
  { text: 'Login Form', link: '/patterns/login-form', icon: 'lock' },
  { text: 'Responsive Navigation', link: '/patterns/responsive-navigation', icon: 'menu' },
  { text: 'Toast Notification', link: '/patterns/toast-notification', icon: 'bell' }
];


const reviewItems = [
  { text: 'Overview', link: '/review', icon: 'message-square-text' },
  { text: 'My Requested Reviews', link: '/review/my-requests', icon: 'layout-grid' },
  { text: 'Review Management', link: '/review/management', icon: 'folder-kanban' }
];

const reviewUtilities = [
  { text: 'Handoff Tools', link: '/review/handoff', icon: 'arrow-left-right' },
  { text: 'Design Sync', link: '/design-sync', icon: 'refresh-cw' },
  { text: 'Visual Regression Testing', link: '/tools/visual-regression', icon: 'git-compare' },
  { text: 'Theme Builder', link: '/theme-builder', icon: 'sliders-horizontal' }
];

const tools = [
  { text: 'Overview', link: '/tools', icon: 'wrench' },
  { text: 'Gradient Generator', link: '/tools/gradient-generator', icon: 'blend' },
  { text: 'Lorem Ipsum Generator', link: '/tools/lorem-ipsum', icon: 'type' },
  { text: 'SEO Tagging Generator', link: '/tools/seo-tagging', icon: 'search' },
  { text: 'Color Scale Generator', link: '/tools/color-scale', icon: 'palette' },
  { text: 'Color Converter', link: '/tools/color-converter', icon: 'arrow-left-right' },
  { text: 'Color Contrast Checker', link: '/tools/color-contrast', icon: 'contrast' },
  { text: 'NASA-TLX', link: '/tools/nasa-tlx', icon: 'brain' },
  { text: 'System Usability Scale', link: '/tools/sus', icon: 'brain' },
  { text: 'Heuristic Evaluation', link: '/tools/heuristic-evaluation', icon: 'list-checks' },
  { text: 'PNG to ICO Converter', link: '/tools/png-to-ico', icon: 'image' },
  { text: 'Theme Builder', link: '/theme-builder', icon: 'sliders-horizontal' },
];

// Group tools by category
const toolGroups = computed(() => ({
  overview: [
    { text: 'Overview', link: '/tools', icon: 'wrench' }
  ],
  color: [
    { text: 'Gradient Generator', link: '/tools/gradient-generator', icon: 'blend' },
    { text: 'Palette Builder', link: '/palette-builder', icon: 'swatch-book' },
    { text: 'Color Converter', link: '/tools/color-converter', icon: 'arrow-left-right' },
    { text: 'Color Contrast Checker', link: '/tools/color-contrast', icon: 'contrast' },
    { text: 'APCA Calculator', link: '/tools/apca-calculator', icon: 'calculator' }
  ],
  text: [
    { text: 'Lorem Ipsum Generator', link: '/tools/lorem-ipsum', icon: 'text-initial' },
    { text: 'SEO Tagging Generator', link: '/tools/seo-tagging', icon: 'hash' },
    { text: 'Font Scale', link: '/tools/font-scale', icon: 'a-large-small' },
    { text: 'Font Stack & Subsetting', link: '/tools/font-stack', icon: 'layers' },
    { text: 'Spacing Scale Generator', link: '/tools/spacing-scale', icon: 'layout-panel-left' },
    { text: 'Box Shadow Generator', link: '/tools/box-shadow', icon: 'layers' },
    { text: 'Border Radius Generator', link: '/tools/border-radius', icon: 'square-round-corner' }
  ],
  development: [
    { text: 'HTML Viewer', link: '/tools/html-viewer', icon: 'eye' },
    { text: 'HTML Escaper', link: '/tools/html-escaper', icon: 'lock' },
    { text: 'PX Unit Converter', link: '/tools/px-converter', icon: 'ruler' },
    { text: 'CSS Converter', link: '/tools/css-converter', icon: 'code' }
  ],
  image: [
    { text: 'Image Converter', link: '/tools/png-to-ico', icon: 'image' },
    { text: 'Image Compressor', link: '/tools/image-compressor', icon: 'shrink' },
    { text: 'Alt Text Generator', link: '/tools/alt-text-generator', icon: 'captions' },
    { text: 'Photosensitivity Analysis', link: '/tools/photosensitivity', icon: 'eye' },
    { text: 'CSS Animation Generator', link: '/tools/css-animation', icon: 'wand-sparkles' }
  ],
  references: [
    { text: 'JAWS Commands', link: '/tools/references/jaws-commands', icon: 'keyboard' },
    { text: 'Penpot for Beginners', link: '/tools/references/penpot-for-beginners', icon: 'brush' },
    { text: 'Units of Measure', link: '/tools/references/units-of-measure', icon: 'ruler' }
  ]
}));

const designAssets = [
  { text: 'Overview', link: '/design-assets', icon: 'images' },
  { text: 'Icons', link: '/design-assets/icons', icon: 'star' },
  { text: 'Font Library', link: '/design-assets/font-library', icon: 'library' },
  { text: 'Country Flags', link: '/design-assets/country-flags', icon: 'flag' },
  { text: 'USG Seals', link: '/design-assets/usg-seals', icon: 'badge-check' },
  { text: 'Internal Seals', link: '/design-assets/internal-seals', icon: 'shield' },
  { text: 'Interactives', link: '/design-assets/interactives', icon: 'pointer' },
  { text: 'Stock Photos', link: '/design-assets/stock-photos', icon: 'images' },
  { text: 'Illustrations', link: '/design-assets/illustrations', icon: 'pencil-line' },
  { text: 'Capability Logos', link: '/design-assets/capability-logos', icon: 'award' },
  { text: 'Company Logos', link: '/design-assets/company-logos', icon: 'building-2' }
];

const componentUtilities = [
  { text: 'Loupe', link: '/components/loupe', icon: 'scan-eye' },
  { text: 'Component Status', link: '/components/status', icon: 'circle-check' },
  { text: 'Testing Framework', link: '/components/testing', icon: 'bug' },
  { text: 'Documentation Generator', link: '/components/documentation', icon: 'file-text' },
  { text: 'Component Composition', link: '/components/composition', icon: 'layout-dashboard' },
  { text: 'Deprecation Manager', link: '/components/deprecation', icon: 'triangle-alert' },
  { text: 'Badge Generator', link: '/components/badge-generator', icon: 'tag' },
  { text: 'Progress Generator', link: '/components/progress-generator', icon: 'trending-up' },
  { text: 'Loading Spinner Generator', link: '/components/loading-generator', icon: 'refresh-cw' }
];

const componentItems = [
  { text: 'Component Scaffolding Wizard', link: '/components/scaffold', icon: 'wand-sparkles' },
  { text: 'Buttons', link: '/components/buttons', icon: 'rectangle-horizontal' },
  { text: 'Color Picker', link: '/components/color-picker', icon: 'pipette' }
];

const adminItems = [
  { text: 'Overview', link: '/admin', icon: 'shield-user' },
  { text: 'Audit Logs', link: '/admin/audit', icon: 'history' },
  { text: 'System Health', link: '/admin/health', icon: 'layout-panel-left' },
  { text: 'Governance', link: '/admin/governance', icon: 'gavel' },
  { text: 'Role Management', link: '/admin/roles', icon: 'shield-user' },
  { text: 'API Keys', link: '/admin/api-keys', icon: 'key' },
  { text: 'Feature Flags', link: '/admin/feature-flags', icon: 'flag' },
  { text: 'Component and Pattern Lifecycle Management', link: '/admin/content', icon: 'file-pen-line' },
  { text: 'Application Management', link: '/admin/applications', icon: 'layout-grid' },
  { text: 'Performance Analysis', link: '/admin/performance', icon: 'gauge' },
  { text: 'Accessibility Reports', link: '/admin/accessibility-reports', icon: 'accessibility' }
];

const gettingStartedBasics = [
  { text: 'Overview', link: '/getting-started', icon: 'rocket' },
  { text: 'Why a Design System?', link: '/getting-started/why-design-system', icon: 'circle-help' },
  { text: 'Quick Start', link: '/getting-started/quick-start', icon: 'play' },
  { text: 'Get in Touch', link: '/getting-started/get-in-touch', icon: 'mail' },
  { text: 'Adopt', link: '/getting-started/adopt', icon: 'trending-up' },
  { text: 'Improving UX Through Acquisition', link: '/getting-started/improving-ux-through-acquisition', icon: 'lightbulb' }
];

const gettingStartedPrinciples = [
  { text: 'Design Principles', link: '/getting-started/principles', icon: 'lightbulb' },
  { text: 'Design Themes', link: '/getting-started/themes', icon: 'palette' }
];

const gettingStartedSetup = [
  { text: 'Installation', link: '/getting-started/installation', icon: 'download' },
  { text: 'Best Practices', link: '/getting-started/best-practices', icon: 'circle-check' },
  { text: 'Contribute', link: '/getting-started/contribute', icon: 'users-round' }
];

const gettingStartedFoundations = [
  { text: 'Atomic Design', link: '/getting-started/foundations/atomic-design', icon: 'flask-conical' },
  { text: 'Building Trust', link: '/getting-started/foundations/building-trust', icon: 'badge-check' },
  { text: 'Responsiveness', link: '/getting-started/foundations/responsiveness', icon: 'monitor-smartphone' },
  { text: 'Usability', link: '/getting-started/foundations/usability', icon: 'accessibility' },
  { text: 'Writing & Content', link: '/getting-started/foundations/writing-content', icon: 'notebook-pen' }
];

const gettingStartedResources = [
  { text: 'Resources', link: '/getting-started/resources', icon: 'book' },
  { text: 'Support', link: '/getting-started/support', icon: 'circle-help' }
];

const researchArtifacts = [
  { text: 'Journey Maps', link: '/research/journey-maps', icon: 'map' },
  { text: 'HCD Reports', link: '/research/hcd-reports', icon: 'file-text' },
  { text: 'User Studies', link: '/research/user-studies', icon: 'users-round' },
  { text: 'Insights & Findings', link: '/research/insights', icon: 'lightbulb' }
];

const uxResearchTools = [
  { text: 'User Persona Generator', link: '/research/user-personas', icon: 'user' },
  { text: 'NASA-TLX', link: '/tools/nasa-tlx', icon: 'brain' },
  { text: 'System Usability Scale', link: '/tools/sus', icon: 'brain' },
  { text: 'Heuristic Evaluation', link: '/tools/heuristic-evaluation', icon: 'list-checks' },
  { text: 'Session Replay', link: '/hcd/session-replay', icon: 'video' }
];

const tokenItems = [
  { text: 'Overview', link: '/tokens', icon: 'swatch-book' },
  { text: 'Design Tokens', link: '/tokens/studio', icon: 'sliders-horizontal' },
  { text: 'AI Tokens', link: '/tokens/ai-builder', icon: 'bot' },
  { text: 'Token Playground', link: '/tokens/playground', icon: 'palette' },
  { text: 'Style Library', link: '/tokens/library', icon: 'library' },
  { text: 'Color Palettes', link: '/tokens/color-palettes', icon: 'palette' }
];

const tokenUtilities = [
  { text: 'Token Migration', link: '/tokens/migration', icon: 'arrow-left-right' },
  { text: 'Token Sync', link: '/tokens/sync', icon: 'refresh-cw' },
  { text: 'Token Relationships', link: '/tokens/relationships', icon: 'network' },
  { text: 'Design Extractor', link: '/tokens/extract', icon: 'download' }
];

const dataVizGenerators = [
  { text: 'Chart Builder', link: '/tools/chart-builder', icon: 'chart-column' },
  { text: 'Map Maker', link: '/tools/map-maker', icon: 'map' },
  { text: 'Timeline Generator', link: '/tools/timeline-generator', icon: 'chart-gantt' },
  { text: 'Table Generator', link: '/tools/table-generator', icon: 'table-2' }
];

const dataVizUtilities = [
  { text: 'Color Scale Generator', link: '/tools/color-scale', icon: 'paint-bucket' }
];

const dataVizGuidance = [
  { text: 'Types of Dashboards', link: '/data-viz/types-of-dashboards', icon: 'layout-dashboard' },
  { text: 'Dashboard Patterns', link: '/data-viz/dashboard-patterns', icon: 'layout-template' },
  { text: 'Dashboard Design', link: '/data-viz/dashboard-design', icon: 'layout-panel-left' }
];

const showAdmin = computed(() => {
  return route.path === '/admin' || route.path.startsWith('/admin/');
});

const showGettingStarted = computed(() => {
  return route.path === '/getting-started' || route.path.startsWith('/getting-started/');
});

const showResearch = computed(() => {
  return route.path === '/research' ||
         route.path.startsWith('/research/') ||
         route.path === '/hcd' ||
         route.path.startsWith('/hcd/') ||
         route.path === '/tools/nasa-tlx' ||
         route.path === '/tools/sus' ||
         route.path === '/tools/heuristic-evaluation';
});

const showGuidelines = computed(() => {
  const path = route.path;
  // Exclude pattern pages - they're handled by showPatterns
  if (path.startsWith('/guidelines/patterns/')) {
    return false;
  }
  return path === '/guidelines' || 
         path.startsWith('/guidelines/') ||
         path === '/colors' ||
         path === '/typography' ||
         path === '/spacing' ||
         path === '/shadows' ||
         path === '/accessibility' ||
         path === '/ai' ||
         path.startsWith('/ai/');
});

const showTokens = computed(() => {
  return route.path === '/tokens' || route.path.startsWith('/tokens/');
});

const showReview = computed(() => {
  return route.path === '/review' || route.path.startsWith('/review/') || route.path === '/design-sync' || route.path.startsWith('/design-sync/') || route.path === '/theme-builder' || route.path === '/tools/visual-regression';
});

const showPatterns = computed(() => {
  const path = route.path;
  return path === '/patterns' || 
         path.startsWith('/patterns/') || 
         path.startsWith('/guidelines/patterns/');
});


const showDataViz = computed(() => {
  const path = route.path;
  // Show for data-viz routes and data visualization tool routes
  if (path === '/data-viz' || path.startsWith('/data-viz/')) {
    return true;
  }
  // Also show for data visualization tool routes
  if (path === '/tools/chart-builder' || path === '/tools/timeline-generator' || 
      path === '/tools/table-generator' || path === '/tools/color-scale' ||
      path === '/tools/map-maker') {
    return true;
  }
  return false;
});

const showTools = computed(() => {
  const path = route.path;
  // Exclude UX Research tools (they're now in HCD)
  // Exclude Theme Builder and Visual Regression (they're now in Review Utilities)
  // Exclude data visualization tools (they're now in Data Viz)
  if (path === '/tools/nasa-tlx' || path === '/tools/sus' || path === '/tools/heuristic-evaluation' || 
      path === '/theme-builder' || path === '/tools/visual-regression' ||
      path === '/tools/chart-builder' || path === '/tools/timeline-generator' || 
      path === '/tools/table-generator' || path === '/tools/color-scale' ||
      path === '/tools/map-maker') {
    return false;
  }
  // Include reference pages in Tools drawer
  return path === '/tools' || path.startsWith('/tools/') || path === '/palette-builder';
});

const showDesignAssets = computed(() => {
  return route.path === '/design-assets' || route.path.startsWith('/design-assets/');
});

const showComponents = computed(() => {
  return route.path === '/components' || route.path.startsWith('/components/');
});

const showAI = computed(() => {
  return route.path === '/ai' || route.path.startsWith('/ai/');
});

const showMainSections = computed(() => {
  return !showPatterns.value && !showComponents.value && !showTools.value && !showDesignAssets.value && !showReview.value && !showTokens.value && !showAdmin.value && !showGettingStarted.value && !showResearch.value && !showAI.value && !showGuidelines.value && !showDataViz.value;
});

const isActive = (path) => {
  return route.path === path || route.path.startsWith(path + '/');
};

// Helper function to check if a route is enabled via feature flag
// This function accesses flagCache, making computed properties that use it reactive
const isRouteEnabled = (routePath) => {
  const flagKey = getFeatureFlagForRoute(routePath);
  if (!flagKey) {
    // No feature flag for this route, allow it (show it)
    return true;
  }
  // Check if the feature flag is enabled (uses cache)
  // Access flagCache directly (it's reactive) - Vue will track this dependency
  const enabled = flagCache[flagKey];
  // Default to false if flag not found (hide until we know it's enabled)
  // This ensures items are hidden when flags are disabled
  return enabled === true; // Only show if explicitly enabled
};

// Filter arrays based on feature flags
// flagCache is reactive, so accessing it in computed properties makes them reactive
const filteredFoundations = computed(() => {
  return foundations.filter(item => isRouteEnabled(item.link));
});

const filteredArtificialIntelligence = computed(() => {
  return artificialIntelligence.filter(item => isRouteEnabled(item.link));
});

const filteredHumanCenteredDesign = computed(() => {
  return humanCenteredDesign.filter(item => isRouteEnabled(item.link));
});

const filteredGuidelines = computed(() => {
  return guidelines.filter(item => isRouteEnabled(item.link));
});

const filteredDesignPatterns = computed(() => {
  return designPatterns.filter(item => isRouteEnabled(item.link));
});

const filteredInteractionPatterns = computed(() => {
  return interactionPatterns.filter(item => isRouteEnabled(item.link));
});

const filteredCodePatterns = computed(() => {
  return codePatterns.filter(item => isRouteEnabled(item.link));
});

const filteredComponentUtilities = computed(() => {
  return componentUtilities.filter(item => isRouteEnabled(item.link));
});

const filteredComponentItems = computed(() => {
  return componentItems.filter(item => isRouteEnabled(item.link));
});

const filteredAdminItems = computed(() => {
  return adminItems.filter(item => isRouteEnabled(item.link));
});

const filteredGettingStartedBasics = computed(() => {
  return gettingStartedBasics.filter(item => isRouteEnabled(item.link));
});

const filteredGettingStartedPrinciples = computed(() => {
  return gettingStartedPrinciples.filter(item => isRouteEnabled(item.link));
});

const filteredGettingStartedSetup = computed(() => {
  return gettingStartedSetup.filter(item => isRouteEnabled(item.link));
});

const filteredGettingStartedFoundations = computed(() => {
  return gettingStartedFoundations.filter(item => isRouteEnabled(item.link));
});

const filteredGettingStartedResources = computed(() => {
  return gettingStartedResources.filter(item => isRouteEnabled(item.link));
});

const filteredResearchArtifacts = computed(() => {
  return researchArtifacts.filter(item => isRouteEnabled(item.link));
});

const filteredUxResearchTools = computed(() => {
  return uxResearchTools.filter(item => isRouteEnabled(item.link));
});

const filteredTokenItems = computed(() => {
  return tokenItems.filter(item => isRouteEnabled(item.link));
});

const filteredTokenUtilities = computed(() => {
  return tokenUtilities.filter(item => isRouteEnabled(item.link));
});

const filteredDesignAssets = computed(() => {
  return designAssets.filter(item => isRouteEnabled(item.link));
});

const filteredToolGroups = computed(() => {
  return {
    overview: toolGroups.value.overview.filter(item => isRouteEnabled(item.link)),
    color: toolGroups.value.color.filter(item => isRouteEnabled(item.link)),
    text: toolGroups.value.text.filter(item => isRouteEnabled(item.link)),
    development: toolGroups.value.development.filter(item => isRouteEnabled(item.link)),
    image: toolGroups.value.image.filter(item => isRouteEnabled(item.link)),
    references: toolGroups.value.references.filter(item => isRouteEnabled(item.link))
  };
});

const filteredDataVizGenerators = computed(() => {
  return dataVizGenerators.filter(item => isRouteEnabled(item.link));
});

const filteredDataVizUtilities = computed(() => {
  return dataVizUtilities.filter(item => isRouteEnabled(item.link));
});

const filteredDataVizGuidance = computed(() => {
  return dataVizGuidance.filter(item => isRouteEnabled(item.link));
});

const filteredReviewItems = computed(() => {
  return reviewItems.filter(item => isRouteEnabled(item.link));
});

const filteredReviewUtilities = computed(() => {
  return reviewUtilities.filter(item => isRouteEnabled(item.link));
});

// Escape key
let escapeHandler = null;

// Function to get all flag keys used in the drawer
const getAllDrawerFlagKeys = () => {
  const allRoutes = [
    ...foundations.map(f => f.link),
    ...artificialIntelligence.map(a => a.link),
    ...humanCenteredDesign.map(h => h.link),
    ...guidelines.map(g => g.link),
    ...designPatterns.map(d => d.link),
    ...interactionPatterns.map(i => i.link),
    ...codePatterns.map(c => c.link),
    ...componentUtilities.map(c => c.link),
    ...componentItems.map(c => c.link),
    ...adminItems.map(a => a.link),
    ...gettingStartedBasics.map(g => g.link),
    ...gettingStartedPrinciples.map(g => g.link),
    ...gettingStartedSetup.map(g => g.link),
    ...gettingStartedFoundations.map(g => g.link),
    ...gettingStartedResources.map(g => g.link),
    ...researchArtifacts.map(r => r.link),
    ...uxResearchTools.map(u => u.link),
    ...tokenItems.map(t => t.link),
    ...designAssets.map(d => d.link),
    ...reviewItems.map(r => r.link),
    ...reviewUtilities.map(r => r.link),
    ...toolGroups.value.overview.map(t => t.link),
    ...toolGroups.value.color.map(t => t.link),
    ...toolGroups.value.text.map(t => t.link),
    ...toolGroups.value.development.map(t => t.link),
    ...toolGroups.value.image.map(t => t.link),
    ...toolGroups.value.references.map(t => t.link),
    ...dataVizGenerators.map(d => d.link),
    ...dataVizUtilities.map(d => d.link),
    ...dataVizGuidance.map(d => d.link),
  ];
  
  // Get unique flag keys for all routes
  const flagKeys = new Set();
  allRoutes.forEach(route => {
    const flagKey = getFeatureFlagForRoute(route);
    if (flagKey) {
      flagKeys.add(flagKey);
    }
  });
  
  return flagKeys;
};

// Function to load all drawer flags
const loadDrawerFlags = async () => {
  const flagKeys = getAllDrawerFlagKeys();
  if (flagKeys.size > 0) {
    try {
      const context = getUserContext();
      
      // Load all flags in parallel
      await Promise.all(
        Array.from(flagKeys).map(async (flagKey) => {
          try {
            // A flag that doesn't exist gates nothing, as in the route guard
            const enabled = await OpenFeature.getBooleanValue(flagKey, true, context);
            flagCache[flagKey] = enabled;
          } catch (error) {
            console.warn(`Failed to load flag ${flagKey}:`, error);
            flagCache[flagKey] = false; // Default to disabled on error
          }
        })
      );
    } catch (error) {
      console.warn('Failed to preload drawer flags:', error);
    }
  }
};

let flagUpdateHandler = null;

onMounted(async () => {
  // Escape key handler
  escapeHandler = (e) => {
    if (e.key === 'Escape' && props.isOpen) {
      close();
    }
  };
  window.addEventListener('keydown', escapeHandler);
  
  // Listen for feature flag updates and refresh drawer flags
  flagUpdateHandler = () => {
    loadDrawerFlags();
  };
  window.addEventListener('feature-flags-updated', flagUpdateHandler);
  
  // Load flags on mount
  await loadDrawerFlags();
});

onBeforeUnmount(() => {
  if (flagUpdateHandler) {
    window.removeEventListener('feature-flags-updated', flagUpdateHandler);
  }
  if (escapeHandler) {
    window.removeEventListener('keydown', escapeHandler);
  }
});
</script>

<style scoped>
/* The closed rail and the open panel sit beside the side nav, under the top bar */
.drawer-rail {
  @apply fixed left-16 sm:left-24 top-16 bottom-0 z-30 flex items-start justify-center w-drawer-closed pt-4 border-r border-line bg-surface transition-all duration-300;
}
.drawer-panel {
  @apply fixed left-16 sm:left-24 top-16 bottom-0 z-30 w-drawer-open overflow-y-auto border-r border-line bg-surface transition-transform duration-300 ease-in-out;
}
.drawer-heading {
  @apply text-sm font-semibold uppercase tracking-wider text-ink-muted;
}
.drawer-subheading {
  @apply mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-ink-muted;
}
.drawer-icon-btn {
  @apply p-2 rounded-pill text-ink-muted transition-colors hover:bg-fill-hover hover:text-ink-strong;
  @apply focus-visible:outline focus-visible:outline-2 outline-focus;
}
.drawer-item {
  @apply flex items-center gap-3 w-full px-4 py-2 rounded-tile text-left text-ink-secondary transition-colors hover:bg-fill-hover hover:text-ink-strong;
  @apply focus-visible:outline focus-visible:outline-2 outline-focus;
}
.drawer-item-on,
.drawer-item-on:hover {
  @apply bg-accent-subtle font-semibold text-accent-text;
}
</style>
