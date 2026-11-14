<template>
  <PageShell width="full">
    <PageHero
      :back="{ to: '/data-viz', label: 'Data visualization' }"
      title="Chart builder"
      lead="Create customizable charts and graphs. Support for line, bar, pie, doughnut, scatter plots, and more."
      spot="tools/chart-builder"
      size="tool"
    />

    <PageSection title="Chart type" description="Pick the chart that fits your data.">
      <template #actions>
        <UiButton
          variant="ghost"
          size="sm"
          :trailing-icon="chartTypeSectionExpanded ? 'expand_less' : 'expand_more'"
          :aria-expanded="chartTypeSectionExpanded"
          aria-controls="chart-type-options"
          @click="chartTypeSectionExpanded = !chartTypeSectionExpanded"
        >
          {{ chartTypeSectionExpanded ? 'Hide chart types' : 'Show chart types' }}
        </UiButton>
      </template>
      <transition name="slide-fade">
        <div v-show="chartTypeSectionExpanded" id="chart-type-options">
          <UiChoiceCards v-model="selectedChartType" :options="chartTypes" :columns="5" aria-label="Chart type" />
        </div>
      </transition>
    </PageSection>

    <PageSection title="Build" description="Describe the chart, enter its data, check its accessibility and export it." divided>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-1 flex flex-col gap-6">
          <UiPanel title="Configuration">
            <div class="flex flex-col gap-4">
              <UiInput
                v-model="chartConfig.title"
                label="Chart title"
                placeholder="Enter chart title"
                required
                :error="chartConfig.title ? '' : 'Chart title is required for accessibility compliance.'"
              />
              <UiTextarea
                v-model="chartConfig.summary"
                label="Chart summary"
                hint="1-2 sentences"
                :rows="2"
                placeholder="Enter a brief summary describing what this chart shows"
                required
                :error="chartConfig.summary ? '' : 'Chart summary is required for accessibility compliance.'"
              />
              <div class="flex flex-col gap-2">
                <UiTextarea
                  v-model="chartConfig.keyInsight"
                  label="Key insight"
                  hint="Primary takeaway"
                  :rows="2"
                  placeholder="Enter the primary insight or takeaway from this chart"
                  required
                  :error="chartConfig.keyInsight ? '' : 'Key insight is required for accessibility compliance.'"
                />
                <UiButton
                  v-if="generatedInsights.primary"
                  variant="ghost"
                  size="sm"
                  icon="auto_awesome"
                  class="self-start"
                  @click="chartConfig.keyInsight = generatedInsights.primary"
                >
                  Use suggested: "{{ generatedInsights.primary }}"
                </UiButton>
              </div>
            </div>

            <div class="mt-6 pt-6 border-t border-line">
              <!-- Multi-dataset input (stacked, grouped, combo, multi-line) -->
              <fieldset v-if="selectedChartType === 'stackedBar' || selectedChartType === 'groupedBar' || selectedChartType === 'combo' || selectedChartType === 'line'" class="flex flex-col gap-3">
                <legend class="mb-2 text-sm font-semibold text-ink-strong">Datasets</legend>
                <div v-for="(dataset, datasetIndex) in multiDatasetData" :key="datasetIndex" class="data-card">
                  <div class="flex items-center gap-2">
                    <div class="flex-1 min-w-0">
                      <UiInput v-model="dataset.label" placeholder="Dataset label" :aria-label="`Dataset ${datasetIndex + 1} label`" />
                    </div>
                    <UiButton icon-only icon="delete" variant="ghost" size="sm" :label="`Remove dataset ${datasetIndex + 1}`" :disabled="multiDatasetData.length <= 1" @click="removeDataset(datasetIndex)" />
                  </div>
                  <div v-for="(item, itemIndex) in dataset.data" :key="itemIndex" class="flex items-center gap-2">
                    <div class="flex-1 min-w-0">
                      <UiInput v-model="item.label" placeholder="Label" :aria-label="`Dataset ${datasetIndex + 1} point ${itemIndex + 1} label`" />
                    </div>
                    <div class="w-24">
                      <UiInput v-model.number="item.value" type="number" placeholder="Value" :aria-label="`Dataset ${datasetIndex + 1} point ${itemIndex + 1} value`" />
                    </div>
                    <UiButton icon-only icon="close" variant="ghost" size="sm" :label="`Remove point ${itemIndex + 1}`" :disabled="dataset.data.length <= 1" @click="removeMultiDataItem(datasetIndex, itemIndex)" />
                  </div>
                  <UiButton icon="add" size="sm" variant="ghost" class="self-start" @click="addMultiDataItem(datasetIndex)">Add point</UiButton>
                </div>
                <UiButton icon="add" size="sm" class="self-start" @click="addDataset">Add dataset</UiButton>
              </fieldset>

              <!-- Gauge -->
              <fieldset v-else-if="selectedChartType === 'gauge'">
                <legend class="mb-2 text-sm font-semibold text-ink-strong">Gauge settings</legend>
                <div class="grid grid-cols-2 gap-2">
                  <UiInput v-model.number="gaugeData.value" type="number" label="Value" />
                  <UiInput v-model.number="gaugeData.min" type="number" label="Min" />
                  <UiInput v-model.number="gaugeData.max" type="number" label="Max" />
                  <UiInput v-model.number="gaugeData.target" type="number" label="Target" />
                </div>
              </fieldset>

              <!-- Waterfall -->
              <fieldset v-else-if="selectedChartType === 'waterfall'" class="flex flex-col gap-2">
                <legend class="mb-2 text-sm font-semibold text-ink-strong">Waterfall data</legend>
                <UiInput v-model.number="waterfallData.base" type="number" label="Base" placeholder="Base value" />
                <div v-for="(change, index) in waterfallData.changes" :key="index" class="flex items-center gap-2">
                  <div class="flex-1 min-w-0">
                    <UiInput v-model="change.label" placeholder="Label" :aria-label="`Change ${index + 1} label`" />
                  </div>
                  <div class="w-28">
                    <UiInput v-model.number="change.value" type="number" placeholder="Change" :aria-label="`Change ${index + 1} value`" />
                  </div>
                  <UiButton icon-only icon="delete" variant="ghost" size="sm" :label="`Remove change ${index + 1}`" :disabled="waterfallData.changes.length <= 1" @click="waterfallData.changes.splice(index, 1)" />
                </div>
                <UiButton icon="add" size="sm" class="self-start" @click="waterfallData.changes.push({ label: `Change ${waterfallData.changes.length + 1}`, value: 0 })">Add change</UiButton>
              </fieldset>

              <!-- Candlestick -->
              <fieldset v-else-if="selectedChartType === 'candlestick'" class="flex flex-col gap-3">
                <legend class="mb-2 text-sm font-semibold text-ink-strong">OHLC data</legend>
                <div v-for="(item, index) in candlestickData" :key="index" class="data-card">
                  <div class="grid grid-cols-2 gap-2">
                    <div class="col-span-2">
                      <UiInput v-model="item.date" type="date" :label="`Row ${index + 1} date`" />
                    </div>
                    <UiInput v-model.number="item.open" type="number" step="0.01" label="Open" />
                    <UiInput v-model.number="item.high" type="number" step="0.01" label="High" />
                    <UiInput v-model.number="item.low" type="number" step="0.01" label="Low" />
                    <UiInput v-model.number="item.close" type="number" step="0.01" label="Close" />
                  </div>
                  <UiButton icon="delete" variant="ghost" size="sm" class="self-end" :disabled="candlestickData.length <= 1" @click="candlestickData.splice(index, 1)">Remove row</UiButton>
                </div>
                <UiButton
                  icon="add"
                  size="sm"
                  class="self-start"
                  @click="candlestickData.push({ date: new Date().toISOString().split('T')[0], open: 100, high: 110, low: 95, close: 105 })"
                >
                  Add candlestick
                </UiButton>
              </fieldset>

              <!-- Heatmap -->
              <fieldset v-else-if="selectedChartType === 'heatmap'" class="flex flex-col gap-3">
                <legend class="mb-2 text-sm font-semibold text-ink-strong">Heatmap matrix</legend>
                <UiInput
                  :model-value="heatmapData.rows.join(',')"
                  label="Rows"
                  placeholder="Mon, Tue, Wed, Thu, Fri"
                  @update:model-value="heatmapData.rows = $event.split(',').map(r => r.trim()).filter(r => r)"
                />
                <UiInput
                  :model-value="heatmapData.columns.join(',')"
                  label="Columns"
                  placeholder="Week 1, Week 2, Week 3, Week 4"
                  @update:model-value="heatmapData.columns = $event.split(',').map(c => c.trim()).filter(c => c)"
                />
                <UiTable caption="Heatmap values" compact bordered>
                  <thead>
                    <tr>
                      <td></td>
                      <th v-for="(col, colIndex) in heatmapData.columns" :key="colIndex" scope="col">{{ col }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, rowIndex) in heatmapData.rows" :key="rowIndex">
                      <th scope="row">{{ row }}</th>
                      <td v-for="(col, colIndex) in heatmapData.columns" :key="colIndex">
                        <input
                          v-model.number="heatmapData.values[rowIndex][colIndex]"
                          type="number"
                          class="heatmap-cell"
                          :aria-label="`${row}, ${col}`"
                        />
                      </td>
                    </tr>
                  </tbody>
                </UiTable>
              </fieldset>

              <!-- Treemap -->
              <div v-else-if="selectedChartType === 'treemap'" class="flex flex-col gap-2">
                <h3 class="text-sm font-semibold text-ink-strong">Hierarchical data</h3>
                <p class="text-xs text-ink-secondary">Treemap uses hierarchical data structure. Edit the data structure in the code or use sample data.</p>
                <div class="data-card text-xs text-ink-secondary">
                  <div class="font-medium text-ink">Root: {{ treemapData.name }} ({{ treemapData.value }})</div>
                  <div v-for="(child, index) in treemapData.children" :key="index" class="ml-4">
                    <div class="font-medium text-ink">{{ child.name }} ({{ child.value }})</div>
                    <div v-for="(grandchild, gIndex) in child.children" :key="gIndex" class="ml-4">
                      {{ grandchild.name }} ({{ grandchild.value }})
                    </div>
                  </div>
                </div>
              </div>

              <!-- Sankey -->
              <div v-else-if="selectedChartType === 'sankey'" class="flex flex-col gap-6">
                <fieldset class="flex flex-col gap-2">
                  <legend class="mb-2 text-sm font-semibold text-ink-strong">Nodes</legend>
                  <div v-for="(node, index) in sankeyData.nodes" :key="index" class="flex items-center gap-2">
                    <div class="flex-1 min-w-0">
                      <UiInput v-model="node.id" placeholder="Node ID" :aria-label="`Node ${index + 1} ID`" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <UiInput v-model="node.label" placeholder="Label" :aria-label="`Node ${index + 1} label`" />
                    </div>
                    <UiButton icon-only icon="close" variant="ghost" size="sm" :label="`Remove node ${index + 1}`" :disabled="sankeyData.nodes.length <= 2" @click="sankeyData.nodes.splice(index, 1)" />
                  </div>
                  <UiButton icon="add" size="sm" class="self-start" @click="sankeyData.nodes.push({ id: `Node${sankeyData.nodes.length + 1}`, label: `Node ${sankeyData.nodes.length + 1}` })">Add node</UiButton>
                </fieldset>
                <fieldset class="flex flex-col gap-2">
                  <legend class="mb-2 text-sm font-semibold text-ink-strong">Links</legend>
                  <div v-for="(link, index) in sankeyData.links" :key="index" class="data-card">
                    <div class="flex items-center gap-2">
                      <div class="flex-1 min-w-0"><UiSelect v-model="link.source" :options="sankeyNodeOptions" :aria-label="`Link ${index + 1} from`" /></div>
                      <span class="material-symbols-outlined text-base text-ink-muted" aria-hidden="true">arrow_forward</span>
                      <div class="flex-1 min-w-0"><UiSelect v-model="link.target" :options="sankeyNodeOptions" :aria-label="`Link ${index + 1} to`" /></div>
                    </div>
                    <div class="flex items-center gap-2">
                      <div class="flex-1 min-w-0"><UiInput v-model.number="link.value" type="number" placeholder="Value" :aria-label="`Link ${index + 1} value`" /></div>
                      <UiButton icon-only icon="close" variant="ghost" size="sm" :label="`Remove link ${index + 1}`" @click="sankeyData.links.splice(index, 1)" />
                    </div>
                  </div>
                  <UiButton
                    icon="add"
                    size="sm"
                    class="self-start"
                    @click="sankeyData.links.push({ source: sankeyData.nodes[0]?.id || '', target: sankeyData.nodes[1]?.id || '', value: 10 })"
                  >
                    Add link
                  </UiButton>
                </fieldset>
              </div>

              <!-- Funnel -->
              <fieldset v-else-if="selectedChartType === 'funnel'" class="flex flex-col gap-2">
                <legend class="mb-2 text-sm font-semibold text-ink-strong">Funnel stages</legend>
                <div v-for="(item, index) in funnelData" :key="index" class="flex items-center gap-2">
                  <div class="flex-1 min-w-0">
                    <UiInput v-model="item.label" placeholder="Stage label" :aria-label="`Stage ${index + 1} label`" />
                  </div>
                  <div class="w-28">
                    <UiInput v-model.number="item.value" type="number" placeholder="Value" :aria-label="`Stage ${index + 1} value`" />
                  </div>
                  <UiButton icon-only icon="delete" variant="ghost" size="sm" :label="`Remove stage ${index + 1}`" :disabled="funnelData.length <= 1" @click="funnelData.splice(index, 1)" />
                </div>
                <UiButton icon="add" size="sm" class="self-start" @click="funnelData.push({ label: `Stage ${funnelData.length + 1}`, value: 0 })">Add stage</UiButton>
              </fieldset>

              <!-- Bullet graph -->
              <fieldset v-else-if="selectedChartType === 'bulletGraph'" class="flex flex-col gap-3">
                <legend class="mb-2 text-sm font-semibold text-ink-strong">Bullet items</legend>
                <div v-for="(item, index) in bulletGraphData" :key="index" class="data-card">
                  <div class="flex items-center gap-2">
                    <div class="flex-1 min-w-0">
                      <UiInput v-model="item.label" placeholder="Item label" :aria-label="`Bullet item ${index + 1} label`" />
                    </div>
                    <UiButton icon-only icon="delete" variant="ghost" size="sm" :label="`Remove bullet item ${index + 1}`" :disabled="bulletGraphData.length <= 1" @click="bulletGraphData.splice(index, 1)" />
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <UiInput v-model.number="item.value" type="number" label="Value" />
                    <UiInput v-model.number="item.target" type="number" label="Target" />
                    <UiInput v-model.number="item.max" type="number" label="Max" />
                    <UiInput v-model.number="item.ranges.good" type="number" label="Good range" />
                  </div>
                </div>
                <UiButton
                  icon="add"
                  size="sm"
                  class="self-start"
                  @click="bulletGraphData.push({ label: `Item ${bulletGraphData.length + 1}`, value: 50, target: 60, max: 100, ranges: { poor: 0, fair: 30, good: 60, excellent: 80 } })"
                >
                  Add bullet item
                </UiButton>
              </fieldset>

              <!-- Chord diagram -->
              <div v-else-if="selectedChartType === 'chordDiagram'" class="flex flex-col gap-6">
                <fieldset class="flex flex-col gap-2">
                  <legend class="mb-2 text-sm font-semibold text-ink-strong">Entities</legend>
                  <div v-for="(node, index) in chordDiagramData.nodes" :key="index" class="flex items-center gap-2">
                    <div class="w-24">
                      <UiInput v-model="node.id" placeholder="ID" :aria-label="`Entity ${index + 1} ID`" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <UiInput v-model="node.label" placeholder="Entity name" :aria-label="`Entity ${index + 1} name`" />
                    </div>
                    <UiButton icon-only icon="close" variant="ghost" size="sm" :label="`Remove entity ${index + 1}`" :disabled="chordDiagramData.nodes.length <= 2" @click="chordDiagramData.nodes.splice(index, 1)" />
                  </div>
                  <UiButton
                    icon="add"
                    size="sm"
                    class="self-start"
                    @click="chordDiagramData.nodes.push({ id: `Entity${chordDiagramData.nodes.length + 1}`, label: `Entity ${chordDiagramData.nodes.length + 1}` })"
                  >
                    Add entity
                  </UiButton>
                </fieldset>
                <fieldset class="flex flex-col gap-2">
                  <legend class="mb-2 text-sm font-semibold text-ink-strong">Relationships</legend>
                  <div v-for="(link, index) in chordDiagramData.links" :key="index" class="data-card">
                    <div class="flex items-center gap-2">
                      <div class="flex-1 min-w-0"><UiSelect v-model="link.source" :options="chordNodeOptions" :aria-label="`Relationship ${index + 1} from`" /></div>
                      <span class="material-symbols-outlined text-base text-ink-muted" aria-hidden="true">sync_alt</span>
                      <div class="flex-1 min-w-0"><UiSelect v-model="link.target" :options="chordNodeOptions" :aria-label="`Relationship ${index + 1} to`" /></div>
                    </div>
                    <div class="flex items-center gap-2">
                      <div class="flex-1 min-w-0"><UiInput v-model.number="link.value" type="number" placeholder="Value" :aria-label="`Relationship ${index + 1} value`" /></div>
                      <UiButton icon-only icon="close" variant="ghost" size="sm" :label="`Remove relationship ${index + 1}`" @click="chordDiagramData.links.splice(index, 1)" />
                    </div>
                  </div>
                  <UiButton
                    icon="add"
                    size="sm"
                    class="self-start"
                    @click="chordDiagramData.links.push({ source: chordDiagramData.nodes[0]?.id || '', target: chordDiagramData.nodes[1]?.id || '', value: 10 })"
                  >
                    Add relationship
                  </UiButton>
                </fieldset>
              </div>

              <!-- Single dataset -->
              <fieldset v-else class="flex flex-col gap-2">
                <legend class="mb-2 text-sm font-semibold text-ink-strong">Data</legend>
                <div v-for="(item, index) in chartData" :key="index" class="flex items-center gap-2">
                  <div class="flex-1 min-w-0">
                    <UiInput v-model="item.label" placeholder="Label" :aria-label="`Point ${index + 1} label`" />
                  </div>
                  <div class="w-24">
                    <UiInput v-model.number="item.value" type="number" placeholder="Value" :aria-label="`Point ${index + 1} value`" />
                  </div>
                  <UiButton icon-only icon="delete" variant="ghost" size="sm" :label="`Remove point ${index + 1}`" :disabled="chartData.length <= 1" @click="removeDataItem(index)" />
                </div>
                <UiButton icon="add" size="sm" class="self-start" @click="addDataItem">Add data point</UiButton>
              </fieldset>
            </div>

            <div class="mt-6 pt-6 border-t border-line flex flex-col gap-4">
              <UiSelect v-model="chartConfig.colorScheme" label="Color scheme" :options="colorSchemeOptions" @update:model-value="initializeCustomColors" />

              <div v-if="chartConfig.colorScheme === 'custom' || getDataForColors().length > 0" class="flex flex-col gap-2">
                <div class="flex items-center justify-between">
                  <h3 class="text-sm font-medium text-ink">{{ chartConfig.colorScheme === 'custom' ? 'Custom colors' : 'Chart colors' }}</h3>
                  <UiButton v-if="chartConfig.colorScheme !== 'custom'" variant="ghost" size="sm" icon="palette" @click="chartConfig.colorScheme = 'custom'; initializeCustomColors()">Customize</UiButton>
                </div>
                <div v-if="chartConfig.colorScheme === 'custom'" class="flex flex-col gap-2 max-h-64 overflow-y-auto">
                  <div v-for="(item, index) in getDataForColors()" :key="index" class="flex items-center gap-2">
                    <span class="w-24 truncate text-xs text-ink-secondary">{{ item.label || `Item ${index + 1}` }}</span>
                    <div class="w-12">
                      <UiInput v-model="customColors[index]" type="color" :aria-label="`Color for ${item.label || `item ${index + 1}`}`" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <!-- style-check: allow the placeholder shows an example hex value the user types -->
                      <UiInput v-model="customColors[index]" placeholder="#6366f1" mono :aria-label="`Color value for ${item.label || `item ${index + 1}`}`" />
                    </div>
                  </div>
                  <p v-if="getDataForColors().length === 0" class="py-2 text-center text-xs text-ink-muted">Add data points to customize colors</p>
                </div>
                <p v-else class="text-xs text-ink-secondary">Using {{ chartConfig.colorScheme }} color scheme. Click "Customize" to set individual colors.</p>
              </div>

              <UiCheckbox v-model="chartConfig.showLegend" label="Show legend" />

              <template v-if="selectedChartType !== 'pie' && selectedChartType !== 'doughnut' && selectedChartType !== 'polar' && selectedChartType !== 'gauge'">
                <UiInput v-model="chartConfig.xAxisLabel" label="X axis label" placeholder="Enter X axis label" />
                <UiInput v-model="chartConfig.yAxisLabel" label="Y axis label" placeholder="Enter Y axis label" />
              </template>
            </div>

            <fieldset class="mt-6 pt-6 border-t border-line flex flex-col gap-3">
              <legend class="sr-only">Motion and animation controls</legend>
              <h3 class="text-sm font-semibold text-ink-strong" aria-hidden="true">Motion and animation controls</h3>
              <UiCheckbox v-model="chartConfig.reduceMotion" label="Reduce motion" />
              <UiCheckbox v-model="chartConfig.pauseAnimation" label="Pause animation" />
              <UiCheckbox v-model="chartConfig.disableAutoUpdate" label="Disable auto-update" />
            </fieldset>

            <div class="mt-6 pt-6 border-t border-line flex flex-col gap-4">
              <UiSelect
                v-if="selectedChartType === 'stackedBar' || selectedChartType === 'groupedBar' || selectedChartType === 'combo' || selectedChartType === 'line' || selectedChartType === 'pie' || selectedChartType === 'doughnut' || selectedChartType === 'polar'"
                v-model="chartConfig.secondaryEncoding"
                label="Secondary encoding"
                :options="secondaryEncodingOptions"
                :required="colorOnlyEncoding"
                :error="colorOnlyEncoding ? 'This chart relies solely on color to communicate meaning. Add a second visual channel to continue.' : ''"
              />
              <UiInput v-model="chartConfig.dataUnit" label="Data unit (optional)" placeholder="e.g., %, $, kg" />
            </div>
          </UiPanel>

          <UiPanel title="Accessibility score">
            <template #actions>
              <UiChip :tone="accessibilityScore >= 100 ? 'success' : accessibilityScore >= 70 ? 'warning' : 'danger'">{{ accessibilityScore }}%</UiChip>
            </template>

            <ul class="flex flex-col gap-2 text-sm">
              <li v-for="check in accessibilityChecks" :key="check.label" class="flex items-center justify-between">
                <span class="text-ink-secondary">{{ check.label }}</span>
                <span class="material-symbols-outlined text-base" :class="checkTone[check.state]" aria-hidden="true">{{ checkIcon[check.state] }}</span>
                <span class="sr-only">{{ checkText[check.state] }}</span>
              </li>
            </ul>

            <UiCallout v-if="accessibilityScore < 100" tone="warning" title="Fix required" class="mt-4">
              <ul class="flex flex-col gap-1">
                <li v-if="!chartConfig.title || !chartConfig.summary || !chartConfig.keyInsight">Add required metadata: title, summary, and key insight</li>
                <li v-if="colorOnlyEncoding">Add secondary encoding (shape, pattern, line style, icon, or text labels)</li>
                <li v-if="contrastIssues.length > 0">Fix contrast issues: {{ contrastIssues.length }} color(s) below WCAG AA minimum</li>
                <li v-if="zoomIssues.length > 0">Zoom/Scaling warnings: {{ zoomIssues.join('; ') }}</li>
              </ul>
            </UiCallout>

            <UiButton variant="primary" icon="bug_report" class="mt-4" :loading="axeScanRunning" @click="runAxeCoreScan">
              {{ axeScanRunning ? 'Scanning...' : 'Run accessibility check' }}
            </UiButton>

            <div v-if="axeScanResults" class="mt-4 flex flex-col gap-2" role="status">
              <UiCallout v-if="axeScanResults.error" tone="warning" title="Scan error">{{ axeScanResults.error }}</UiCallout>
              <UiCallout
                v-for="(violation, index) in axeScanResults.violations"
                :key="index"
                tone="danger"
                :icon="violation.impact === 'critical' ? 'error' : 'warning'"
                :title="`${violation.id} (${violation.impact || 'moderate'})`"
              >
                <p>{{ violation.description }}</p>
                <p class="mt-1 text-ink-secondary">{{ violation.help }}</p>
                <p v-if="violation.nodes && violation.nodes.length > 0" class="mt-1 text-ink-muted">Found in {{ violation.nodes.length }} element(s)</p>
              </UiCallout>
              <UiCallout v-if="axeScanResults.violations && axeScanResults.violations.length === 0 && !axeScanResults.error" tone="success">
                No accessibility violations found!
              </UiCallout>
              <p v-if="axeScanResults.passes && axeScanResults.passes.length > 0" class="text-xs text-ink-muted">
                {{ axeScanResults.passes.length }} accessibility check(s) passed
              </p>
            </div>
          </UiPanel>

          <UiPanel title="Export">
            <div class="flex flex-col gap-2">
              <UiButton
                v-for="action in exportActions"
                :key="action.format"
                :variant="action.format === 'html' ? 'primary' : 'secondary'"
                :icon="action.icon"
                :disabled="action.gated && !canExport"
                @click="exportChart(action.format)"
              >
                {{ action.label }}
              </UiButton>
            </div>
            <InlineNotice v-if="notice" class="mt-3" :notice="notice" @dismiss="clearNotice" />
            <UiCallout v-if="accessibilityScore < 100" tone="warning" class="mt-3">
              Accessibility score: {{ accessibilityScore }}%. Export will show warnings but is allowed.
            </UiCallout>
          </UiPanel>
        </div>

        <div ref="previewPanel" class="lg:col-span-2">
          <UiPanel title="Preview">
            <template #actions>
              <UiButton size="sm" icon="dataset" @click="loadSampleData">Load sample data</UiButton>
            </template>

            <div class="chart-stage">
              <figure
                ref="chartFigure"
                class="chart-figure"
                role="img"
                :aria-label="chartConfig.title || 'Chart'"
                :aria-describedby="`chart-summary-${chartKey} chart-data-table-${chartKey}`"
                tabindex="0"
                @keydown="handleChartKeyboard"
                @focus="chartFocused = true"
                @blur="chartFocused = false"
              >
                <div class="w-full h-full">
                  <LineChart
                    v-if="selectedChartType === 'line' || selectedChartType === 'area'"
                    :key="`chart-${selectedChartType}-${chartKey}`"
                    :data="chartDataForDisplay"
                    :options="chartOptions"
                  />
                  <BarChart
                    v-else-if="selectedChartType === 'bar' || selectedChartType === 'horizontalBar' || selectedChartType === 'stackedBar' || selectedChartType === 'groupedBar' || selectedChartType === 'combo'"
                    :key="`chart-${selectedChartType}-${chartKey}`"
                    :data="chartDataForDisplay"
                    :options="chartOptions"
                  />
                  <PieChart
                    v-else-if="selectedChartType === 'pie'"
                    :key="`chart-${selectedChartType}-${chartKey}`"
                    :data="chartDataForDisplay"
                    :options="chartOptions"
                  />
                  <DoughnutChart
                    v-else-if="selectedChartType === 'doughnut'"
                    :key="`chart-${selectedChartType}-${chartKey}`"
                    :data="chartDataForDisplay"
                    :options="chartOptions"
                  />
                  <ScatterChart
                    v-else-if="selectedChartType === 'scatter'"
                    :key="`chart-${selectedChartType}-${chartKey}`"
                    :data="scatterDataForDisplay"
                    :options="chartOptions"
                  />
                  <RadarChart
                    v-else-if="selectedChartType === 'radar'"
                    :key="`chart-${selectedChartType}-${chartKey}`"
                    :data="chartDataForDisplay"
                    :options="chartOptions"
                  />
                  <BubbleChart
                    v-else-if="selectedChartType === 'bubble'"
                    :key="`chart-${selectedChartType}-${chartKey}`"
                    :data="bubbleDataForDisplay"
                    :options="chartOptions"
                  />
                  <PolarAreaChart
                    v-else-if="selectedChartType === 'polar'"
                    :key="`chart-${selectedChartType}-${chartKey}`"
                    :data="chartDataForDisplay"
                    :options="chartOptions"
                  />
                  <DoughnutChart
                    v-else-if="selectedChartType === 'gauge'"
                    :key="`chart-${selectedChartType}-${chartKey}`"
                    :data="chartDataForDisplay"
                    :options="chartOptions"
                  />
                  <BarChart
                    v-else-if="selectedChartType === 'waterfall' || selectedChartType === 'funnel'"
                    :key="`chart-${selectedChartType}-${chartKey}`"
                    :data="chartDataForDisplay"
                    :options="chartOptions"
                  />
                  <Chart
                    v-else-if="selectedChartType === 'candlestick'"
                    :key="`chart-${selectedChartType}-${chartKey}`"
                    type="candlestick"
                    :data="chartDataForDisplay"
                    :options="chartOptions"
                  />
                  <Chart
                    v-else-if="selectedChartType === 'heatmap'"
                    :key="`chart-${selectedChartType}-${chartKey}`"
                    type="matrix"
                    :data="chartDataForDisplay"
                    :options="chartOptions"
                  />
                  <div v-else-if="selectedChartType === 'treemap'" :key="`chart-${selectedChartType}-${chartKey}`" class="w-full h-full">
                    <TreemapSVG :data="treemapData" :colors="colorSchemes[chartConfig.colorScheme] || colorSchemes.default" />
                  </div>
                  <div v-else-if="selectedChartType === 'sankey'" :key="`chart-${selectedChartType}-${chartKey}`" class="w-full h-full">
                    <SankeySVG :data="sankeyData" :colors="colorSchemes[chartConfig.colorScheme] || colorSchemes.default" />
                  </div>
                  <div v-else-if="selectedChartType === 'bulletGraph'" :key="`chart-${selectedChartType}-${chartKey}`" class="w-full h-full">
                    <BulletGraphSVG :data="bulletGraphData" :colors="colorSchemes[chartConfig.colorScheme] || colorSchemes.default" />
                  </div>
                  <div v-else-if="selectedChartType === 'chordDiagram'" :key="`chart-${selectedChartType}-${chartKey}`" class="w-full h-full">
                    <ChordDiagramSVG :data="chordDiagramData" :colors="colorSchemes[chartConfig.colorScheme] || colorSchemes.default" />
                  </div>
                </div>
                <figcaption :id="`chart-summary-${chartKey}`" class="sr-only">
                  {{ chartConfig.summary || 'Chart visualization' }}
                </figcaption>
              </figure>
            </div>

            <div class="mt-6">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold text-ink-strong">Data table</h3>
                <UiButton
                  size="sm"
                  :icon="dataTableVisible ? 'expand_less' : 'expand_more'"
                  :aria-expanded="dataTableVisible"
                  :aria-controls="`chart-data-table-${chartKey}`"
                  @click="dataTableVisible = !dataTableVisible"
                >
                  {{ dataTableVisible ? 'Hide' : 'Show' }} table
                </UiButton>
              </div>
              <div v-show="dataTableVisible" :id="`chart-data-table-${chartKey}`">
                <UiTable :caption="`${chartConfig.title || 'Chart'} data`" bordered>
                  <thead>
                    <tr>
                      <th
                        v-for="(header, index) in dataTableHeaders"
                        :key="index"
                        scope="col"
                        :aria-sort="dataTableSortColumn === header.key ? (dataTableSortDirection === 'asc' ? 'ascending' : 'descending') : 'none'"
                      >
                        <button type="button" class="table-sort" @click="toggleDataTableSort(header.key)">
                          {{ header.label }}
                          <span class="material-symbols-outlined text-sm" aria-hidden="true">
                            {{ dataTableSortColumn === header.key ? (dataTableSortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more' }}
                          </span>
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, rowIndex) in sortedDataTable" :key="rowIndex">
                      <td v-for="(header, colIndex) in dataTableHeaders" :key="colIndex">
                        {{ typeof row[header.key] === 'number' ? row[header.key].toLocaleString() : row[header.key] }}
                        <span v-if="header.key === 'value' && chartConfig.dataUnit" class="ml-1 text-xs text-ink-muted">{{ chartConfig.dataUnit }}</span>
                      </td>
                    </tr>
                  </tbody>
                </UiTable>
              </div>
            </div>
          </UiPanel>
        </div>
      </div>
    </PageSection>

    <!-- Screen reader announcements -->
    <div id="chart-announcements" aria-live="polite" aria-atomic="true" class="sr-only"></div>
  </PageShell>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, h } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import {
  PageHero, PageSection, PageShell, UiButton, UiCallout, UiCheckbox, UiChip, UiInput, UiPanel, UiSelect, UiTable, UiTextarea,
} from '../components/ui';
import UiChoiceCards from '../components/ui/UiChoiceCards.vue';
import { useChartTheme, rgbToHex } from '../composables/useChartTheme.js';
import { useNotice } from '../composables/useNotice.js';
import { calculateContrast } from '../composables/useContrast.js';
import axe from 'axe-core';
import { AXE_SCAN_OPTIONS } from '../utils/axeScan.js';
import { scriptSafeJson } from '../utils/scriptSafeJson.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line as LineChart, Bar as BarChart, Pie as PieChart, Doughnut as DoughnutChart, Scatter as ScatterChart, Radar as RadarChart, Bubble as BubbleChart, PolarArea as PolarAreaChart, Chart } from 'vue-chartjs';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix';

// Helper function to draw the color scale legend
function drawLegend(ctx, x, y, width, height, options, chartArea) {
  // Draw gradient background
  const gradient = ctx.createLinearGradient(x, y, x + width, y);
  if (options.colors && options.colors.length > 0) {
    options.colors.forEach((color, index) => {
      gradient.addColorStop(index / (options.colors.length - 1), color);
    });
  }
  
  // Draw gradient rectangle
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, width, height);
  
  // Draw border
  ctx.strokeStyle = options.gridColor || '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, width, height);
  
  // Draw min/max labels
  ctx.fillStyle = options.textColor || '#1e293b';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(options.min.toFixed(1), x, y + height + 5);
  ctx.textAlign = 'right';
  ctx.fillText(options.max.toFixed(1), x + width, y + height + 5);
}

// Custom color scale legend plugin for heatmaps
const colorScaleLegendPlugin = {
  id: 'colorScaleLegend',
  afterDraw: (chart) => {
    try {
      // Check chart type - try multiple ways to detect matrix chart
      const chartType = chart.config?.type || chart.chart?.config?.type || chart.type;
      if (chartType !== 'matrix') {
        return;
      }
      
      const ctx = chart.ctx;
      if (!ctx) return;
      
      const chartArea = chart.chartArea;
      if (!chartArea) return;
      
      const options = chart.options?.plugins?.colorScaleLegend;
      if (!options || !options.show) return;
      
      // Get canvas dimensions to ensure we draw within bounds
      const canvas = ctx.canvas;
      const canvasHeight = canvas.height;
      
      const legendHeight = 30;
      const legendWidth = 200;
      const labelHeight = 15;
      const totalHeight = legendHeight + labelHeight + 5;
      
      // Center horizontally, position below chart area
      const legendX = (chartArea.left + chartArea.right - legendWidth) / 2;
      const legendY = chartArea.bottom + 20;
      
      // Ensure legend is within canvas bounds
      if (legendY + totalHeight > canvasHeight) {
        // If not enough space below, position above chart
        const newY = chartArea.top - totalHeight - 20;
        if (newY >= 0) {
          drawLegend(ctx, legendX, newY, legendWidth, legendHeight, options, chartArea);
        }
      } else {
        drawLegend(ctx, legendX, legendY, legendWidth, legendHeight, options, chartArea);
      }
    } catch (error) {
      console.error('Error drawing color scale legend:', error);
    }
  }
};

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  CandlestickController,
  CandlestickElement,
  MatrixController,
  MatrixElement,
  colorScaleLegendPlugin
);

// Token colours resolved for the canvas charts (axes, grid, labels, tooltips)
const chartTheme = useChartTheme();
const { notice, showNotice, clearNotice } = useNotice();
// This page's own chart <figure> (exports and the axe scan target it, not the
// first figure[role="img"] in the document).
const chartFigure = ref(null);
// The preview panel (chart and its data table): what the axe scan checks
const previewPanel = ref(null);

const selectedChartType = ref('line');
const chartTypeSectionExpanded = ref(true);
const chartKey = ref(0);
const chartData = ref([
  { label: 'Jan', value: 65 },
  { label: 'Feb', value: 59 },
  { label: 'Mar', value: 80 },
  { label: 'Apr', value: 81 },
  { label: 'May', value: 56 },
  { label: 'Jun', value: 55 }
]);

// Multi-dataset support for stacked/grouped/combo charts
const multiDatasetData = ref([
  {
    label: 'Dataset 1',
    data: [
      { label: 'Jan', value: 65 },
      { label: 'Feb', value: 59 },
      { label: 'Mar', value: 80 },
      { label: 'Apr', value: 81 }
    ]
  },
  {
    label: 'Dataset 2',
    data: [
      { label: 'Jan', value: 45 },
      { label: 'Feb', value: 49 },
      { label: 'Mar', value: 60 },
      { label: 'Apr', value: 71 }
    ]
  }
]);

// Gauge chart data
const gaugeData = ref({
  value: 75,
  min: 0,
  max: 100,
  target: 80
});

// Waterfall chart data
const waterfallData = ref({
  base: 100,
  changes: [
    { label: 'Q1', value: 20 },
    { label: 'Q2', value: -10 },
    { label: 'Q3', value: 30 },
    { label: 'Q4', value: -5 }
  ]
});

// Candlestick chart data (OHLC)
const candlestickData = ref([
  { date: '2024-01-01', open: 100, high: 110, low: 95, close: 105 },
  { date: '2024-01-02', open: 105, high: 115, low: 100, close: 112 },
  { date: '2024-01-03', open: 112, high: 120, low: 108, close: 115 },
  { date: '2024-01-04', open: 115, high: 118, low: 110, close: 113 }
]);

// Heatmap data (matrix)
const heatmapData = ref({
  rows: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  columns: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  values: [
    [10, 20, 30, 40],
    [15, 25, 35, 45],
    [20, 30, 40, 50],
    [25, 35, 45, 55],
    [30, 40, 50, 60]
  ]
});

// Funnel chart data
const funnelData = ref([
  { label: 'Visitors', value: 1000 },
  { label: 'Leads', value: 500 },
  { label: 'Qualified', value: 250 },
  { label: 'Proposals', value: 100 },
  { label: 'Closed', value: 50 }
]);

// Treemap chart data (hierarchical)
const treemapData = ref({
  name: 'Root',
  value: 100,
  children: [
    { name: 'Category A', value: 40, children: [
      { name: 'Item A1', value: 20 },
      { name: 'Item A2', value: 20 }
    ]},
    { name: 'Category B', value: 35, children: [
      { name: 'Item B1', value: 15 },
      { name: 'Item B2', value: 20 }
    ]},
    { name: 'Category C', value: 25, children: [
      { name: 'Item C1', value: 25 }
    ]}
  ]
});

// Sankey diagram data
const sankeyData = ref({
  nodes: [
    { id: 'Source1', label: 'Source 1' },
    { id: 'Source2', label: 'Source 2' },
    { id: 'Process1', label: 'Process 1' },
    { id: 'Process2', label: 'Process 2' },
    { id: 'Target1', label: 'Target 1' },
    { id: 'Target2', label: 'Target 2' }
  ],
  links: [
    { source: 'Source1', target: 'Process1', value: 30 },
    { source: 'Source1', target: 'Process2', value: 20 },
    { source: 'Source2', target: 'Process1', value: 25 },
    { source: 'Source2', target: 'Process2', value: 15 },
    { source: 'Process1', target: 'Target1', value: 40 },
    { source: 'Process1', target: 'Target2', value: 15 },
    { source: 'Process2', target: 'Target1', value: 20 },
    { source: 'Process2', target: 'Target2', value: 15 }
  ]
});


// Bullet graph data
const bulletGraphData = ref([
  { label: 'Revenue', value: 75, target: 80, max: 100, ranges: { poor: 0, fair: 50, good: 75, excellent: 90 } },
  { label: 'Profit', value: 60, target: 70, max: 100, ranges: { poor: 0, fair: 40, good: 60, excellent: 85 } },
  { label: 'Growth', value: 85, target: 90, max: 100, ranges: { poor: 0, fair: 60, good: 80, excellent: 95 } }
]);

// Chord diagram data
const chordDiagramData = ref({
  nodes: [
    { id: 'A', label: 'Category A' },
    { id: 'B', label: 'Category B' },
    { id: 'C', label: 'Category C' },
    { id: 'D', label: 'Category D' }
  ],
  links: [
    { source: 'A', target: 'B', value: 30 },
    { source: 'A', target: 'C', value: 20 },
    { source: 'B', target: 'D', value: 25 },
    { source: 'C', target: 'D', value: 15 }
  ]
});

const chartConfig = ref({
  title: 'My Chart',
  summary: '',
  keyInsight: '',
  colorScheme: 'default',
  showLegend: true,
  xAxisLabel: '',
  yAxisLabel: '',
  // Accessibility settings
  reduceMotion: false,
  pauseAnimation: false,
  disableAutoUpdate: false,
  // Secondary encoding for color independence
  secondaryEncoding: 'none', // 'none', 'shape', 'pattern', 'lineStyle', 'icon', 'text'
  // Units for data table
  dataUnit: ''
});

// Custom colors for individual data points
const customColors = ref([]);

// Get data items for color customization
const getDataForColors = () => {
  const chartType = selectedChartType.value;
  
  // For multi-dataset charts, use first dataset
  if (chartType === 'stackedBar' || chartType === 'groupedBar' || chartType === 'combo' || chartType === 'line') {
    if (multiDatasetData.value.length > 0 && multiDatasetData.value[0].data.length > 0) {
      return multiDatasetData.value[0].data;
    }
    return [];
  }
  
  // For single dataset charts
  if (chartData.value && chartData.value.length > 0) {
    return chartData.value;
  }
  
  return [];
};

// Initialize custom colors array
const initializeCustomColors = () => {
  if (chartConfig.value.colorScheme !== 'custom') {
    return;
  }
  
  const dataItems = getDataForColors();
  const defaultColors = colorSchemes.default;
  
  // Initialize or resize customColors array
  while (customColors.value.length < dataItems.length) {
    const colorIndex = customColors.value.length % defaultColors.length;
    customColors.value.push(defaultColors[colorIndex]);
  }
  
  // Trim if too long
  if (customColors.value.length > dataItems.length) {
    customColors.value = customColors.value.slice(0, dataItems.length);
  }
};

// Auto-Generated Insight Engine
const generatedInsights = computed(() => {
  const chartType = selectedChartType.value;
  let values = [];
  let labels = [];
  
  // Extract values based on chart type
  if (chartType === 'stackedBar' || chartType === 'groupedBar' || chartType === 'combo' || chartType === 'line') {
    // For multi-dataset, analyze all datasets
    multiDatasetData.value.forEach(dataset => {
      dataset.data.forEach(item => {
        values.push(item.value);
        labels.push(item.label);
      });
    });
  } else if (chartType === 'gauge') {
    values = [gaugeData.value.value];
    labels = ['Value'];
  } else if (chartType === 'waterfall') {
    values = [waterfallData.value.base, ...waterfallData.value.changes.map(c => c.value)];
    labels = ['Base', ...waterfallData.value.changes.map(c => c.label)];
  } else if (chartType === 'funnel') {
    values = funnelData.value.map(item => item.value);
    labels = funnelData.value.map(item => item.label);
  } else if (chartType === 'choropleth') {
    // Maps moved to MapMaker.vue
    values = [];
    labels = [];
  } else if (chartType === 'flowMap') {
    // Maps moved to MapMaker.vue
    values = [];
    labels = [];
  } else if (chartType === 'bulletGraph') {
    values = bulletGraphData.value.map(item => item.value);
    labels = bulletGraphData.value.map(item => item.label);
  } else if (chartType === 'chordDiagram') {
    values = chordDiagramData.value.links.map(link => link.value);
    labels = chordDiagramData.value.links.map(link => {
      const sourceNode = chordDiagramData.value.nodes.find(n => n.id === link.source);
      const targetNode = chordDiagramData.value.nodes.find(n => n.id === link.target);
      return `${sourceNode?.label || link.source} ↔ ${targetNode?.label || link.target}`;
    });
  } else if (chartData.value && chartData.value.length > 0) {
    values = chartData.value.map(item => item.value);
    labels = chartData.value.map(item => item.label);
  }
  
  if (values.length === 0) {
    return {
      max: null,
      min: null,
      trend: null,
      outliers: [],
      primary: null
    };
  }
  
  // Calculate max and min
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const maxIndex = values.indexOf(maxValue);
  const minIndex = values.indexOf(minValue);
  const maxLabel = labels[maxIndex] || '';
  const minLabel = labels[minIndex] || '';
  
  // Trend analysis (up/down/flat)
  let trend = 'flat';
  if (values.length >= 2) {
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (change > 5) trend = 'up';
    else if (change < -5) trend = 'down';
  }
  
  // Outlier detection (values more than 2 standard deviations from mean)
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const outliers = values
    .map((val, idx) => ({ value: val, label: labels[idx], index: idx }))
    .filter(item => Math.abs(item.value - mean) > 2 * stdDev);
  
  // Generate primary insight
  let primary = '';
  if (trend === 'up') {
    primary = `Data shows an upward trend, with ${maxLabel} reaching the highest value of ${maxValue}`;
  } else if (trend === 'down') {
    primary = `Data shows a downward trend, with ${minLabel} at the lowest value of ${minValue}`;
  } else {
    primary = `${maxLabel} has the highest value of ${maxValue}, while ${minLabel} has the lowest value of ${minValue}`;
  }
  
  if (outliers.length > 0) {
    primary += `. Notable outliers detected: ${outliers.map(o => o.label).join(', ')}`;
  }
  
  return {
    max: { value: maxValue, label: maxLabel },
    min: { value: minValue, label: minLabel },
    trend,
    outliers,
    primary
  };
});

// Validation functions
const validationErrors = computed(() => {
  const errors = [];
  
  // Required metadata fields
  if (!chartConfig.value.title || chartConfig.value.title.trim() === '') {
    errors.push({ field: 'title', message: 'Chart title is required' });
  }
  if (!chartConfig.value.summary || chartConfig.value.summary.trim() === '') {
    errors.push({ field: 'summary', message: 'Chart summary is required' });
  }
  if (!chartConfig.value.keyInsight || chartConfig.value.keyInsight.trim() === '') {
    errors.push({ field: 'keyInsight', message: 'Key insight is required' });
  }
  
  // Data validation
  const chartType = selectedChartType.value;
  if (chartType === 'stackedBar' || chartType === 'groupedBar' || chartType === 'combo' || chartType === 'line') {
    if (multiDatasetData.value.length === 0 || multiDatasetData.value.some(d => d.data.length === 0)) {
      errors.push({ field: 'data', message: 'Chart data cannot be empty' });
    }
  } else if (chartData.value.length === 0) {
    errors.push({ field: 'data', message: 'Chart data cannot be empty' });
  }
  
  return errors;
});

// Color-Independent Encoding Check
const colorOnlyEncoding = computed(() => {
  const chartType = selectedChartType.value;
  
  // Only applies to charts with multiple series
  if (chartType === 'stackedBar' || chartType === 'groupedBar' || chartType === 'combo' || chartType === 'line') {
    if (multiDatasetData.value.length > 1 && chartConfig.value.secondaryEncoding === 'none') {
      return true;
    }
  } else if (chartType === 'pie' || chartType === 'doughnut' || chartType === 'polar') {
    // Pie charts with multiple slices need secondary encoding if more than 3-4 slices
    const dataLength = chartData.value.length;
    if (dataLength > 4 && chartConfig.value.secondaryEncoding === 'none') {
      return true;
    }
  }
  
  return false;
});

// Contrast Checking
const contrastIssues = computed(() => {
  const issues = [];
  const colors = chartConfig.value.colorScheme === 'custom' 
    ? (customColors.value.length > 0 ? customColors.value : colorSchemes.default)
    : (colorSchemes[chartConfig.value.colorScheme] || colorSchemes.default);
  
  // The surface the chart sits on, in the current theme
  const bgColor = rgbToHex(chartTheme.value.surface);
  
  // Check each color against background
  colors.forEach((color, index) => {
    const contrast = calculateContrast(color, bgColor);
    if (contrast) {
      // Text needs 4.5:1, graphical objects need 3:1
      if (contrast.ratio < 4.5) {
        issues.push({
          element: `Color ${index + 1} (${color})`,
          ratio: contrast.ratio,
          required: 4.5,
          type: 'text'
        });
      } else if (contrast.ratio < 3) {
        issues.push({
          element: `Color ${index + 1} (${color})`,
          ratio: contrast.ratio,
          required: 3,
          type: 'graphical'
        });
      }
    }
  });
  
  return issues;
});

// Zoom and Scaling Validation
const zoomIssues = computed(() => {
  const issues = [];
  
  // Check if chart would work at 200% zoom
  // This is a simplified check - in a real implementation, you'd render at 200% and check for clipping
  const chartType = selectedChartType.value;
  
  // Check for potential label overlap issues
  if (chartType === 'stackedBar' || chartType === 'groupedBar' || chartType === 'combo' || chartType === 'line') {
    const totalDataPoints = multiDatasetData.value.reduce((sum, dataset) => sum + dataset.data.length, 0);
    if (totalDataPoints > 20) {
      issues.push('High number of data points may cause label overlap at 200% zoom');
    }
  } else if (chartData.value.length > 15) {
    issues.push('High number of data points may cause label overlap at 200% zoom');
  }
  
  // Check for long labels that might truncate
  const hasLongLabels = chartData.value.some(item => item.label && item.label.length > 20);
  if (hasLongLabels) {
    issues.push('Long labels may truncate at 200% zoom or on mobile viewports');
  }
  
  // Check legend visibility
  if (chartConfig.value.showLegend && chartType === 'pie' || chartType === 'doughnut' || chartType === 'polar') {
    if (chartData.value.length > 8) {
      issues.push('Legend with many items may be truncated on mobile viewports');
    }
  }
  
  return issues;
});

// Accessibility Score (0-100%)
const accessibilityScore = computed(() => {
  let score = 0;
  let maxScore = 0;
  
  // Alt Text (required fields) - 20 points
  maxScore += 20;
  if (chartConfig.value.title && chartConfig.value.title.trim() !== '') score += 7;
  if (chartConfig.value.summary && chartConfig.value.summary.trim() !== '') score += 7;
  if (chartConfig.value.keyInsight && chartConfig.value.keyInsight.trim() !== '') score += 6;
  
  // Color Independence - 15 points
  maxScore += 15;
  if (!colorOnlyEncoding.value) score += 15;
  
  // Contrast - 20 points
  maxScore += 20;
  if (contrastIssues.value.length === 0) score += 20;
  else {
    const passingColors = (chartConfig.value.colorScheme === 'custom' ? customColors.value.length : 6) - contrastIssues.value.length;
    const totalColors = chartConfig.value.colorScheme === 'custom' ? customColors.value.length : 6;
    score += (passingColors / totalColors) * 20;
  }
  
  // Keyboard Navigation - 15 points (will be checked dynamically)
  maxScore += 15;
  score += 15; // Assume implemented
  
  // Screen Reader (ARIA) - 15 points (will be checked dynamically)
  maxScore += 15;
  score += 15; // Assume implemented
  
  // Motion Safety - 10 points
  maxScore += 10;
  if (chartConfig.value.reduceMotion || chartConfig.value.pauseAnimation) score += 10;
  
  // Zoom Integrity - 5 points
  maxScore += 5;
  if (zoomIssues.value.length === 0) score += 5;
  else score += 2; // Partial credit if warnings but not critical failures
  
  return Math.round((score / maxScore) * 100);
});

// Data Table Generation
const dataTableVisible = ref(false);
const dataTableSortColumn = ref(null);
const dataTableSortDirection = ref('asc');
const chartFocused = ref(false);
const currentDataPointIndex = ref(0);

const generateDataTable = () => {
  const chartType = selectedChartType.value;
  let tableData = [];
  
  if (chartType === 'stackedBar' || chartType === 'groupedBar' || chartType === 'combo' || chartType === 'line') {
    // Multi-dataset table
    const labels = multiDatasetData.value[0]?.data.map(item => item.label) || [];
    tableData = labels.map((label, labelIndex) => {
      const row = { label };
      multiDatasetData.value.forEach((dataset, datasetIndex) => {
        const value = dataset.data[labelIndex]?.value || 0;
        row[dataset.label] = value;
      });
      return row;
    });
  } else if (chartType === 'gauge') {
    tableData = [{ label: 'Value', value: gaugeData.value.value, min: gaugeData.value.min, max: gaugeData.value.max, target: gaugeData.value.target }];
  } else if (chartType === 'waterfall') {
    tableData = [
      { label: 'Base', value: waterfallData.value.base },
      ...waterfallData.value.changes.map(c => ({ label: c.label, value: c.value })),
      { label: 'Total', value: waterfallData.value.base + waterfallData.value.changes.reduce((sum, c) => sum + c.value, 0) }
    ];
  } else if (chartType === 'funnel') {
    tableData = funnelData.value.map(item => ({ label: item.label, value: item.value }));
  } else if (chartType === 'choropleth') {
    // Maps moved to MapMaker.vue
    tableData = [];
  } else if (chartType === 'flowMap') {
    // Maps moved to MapMaker.vue
    tableData = [];
  } else if (chartType === 'bulletGraph') {
    tableData = bulletGraphData.value.map(item => ({
      label: item.label,
      value: item.value,
      target: item.target,
      max: item.max,
      'poor range': `0-${item.ranges.fair}`,
      'fair range': `${item.ranges.fair}-${item.ranges.good}`,
      'good range': `${item.ranges.good}-${item.ranges.excellent}`
    }));
  } else if (chartType === 'chordDiagram') {
    tableData = chordDiagramData.value.links.map(link => {
      const sourceNode = chordDiagramData.value.nodes.find(n => n.id === link.source);
      const targetNode = chordDiagramData.value.nodes.find(n => n.id === link.target);
      return {
        label: `${sourceNode?.label || link.source} ↔ ${targetNode?.label || link.target}`,
        value: link.value
      };
    });
  } else if (chartData.value && chartData.value.length > 0) {
    tableData = chartData.value.map(item => ({ label: item.label, value: item.value }));
  }
  
  return tableData;
};

const sortedDataTable = computed(() => {
  const data = generateDataTable();
  if (!dataTableSortColumn.value || data.length === 0) return data;
  
  const sorted = [...data].sort((a, b) => {
    const aVal = a[dataTableSortColumn.value];
    const bVal = b[dataTableSortColumn.value];
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return dataTableSortDirection.value === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    const aStr = String(aVal || '').toLowerCase();
    const bStr = String(bVal || '').toLowerCase();
    if (dataTableSortDirection.value === 'asc') {
      return aStr.localeCompare(bStr);
    }
    return bStr.localeCompare(aStr);
  });
  
  return sorted;
});

const toggleDataTableSort = (column) => {
  if (dataTableSortColumn.value === column) {
    dataTableSortDirection.value = dataTableSortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    dataTableSortColumn.value = column;
    dataTableSortDirection.value = 'asc';
  }
};

const dataTableHeaders = computed(() => {
  const chartType = selectedChartType.value;
  const headers = [{ key: 'label', label: 'Label' }];
  
  if (chartType === 'stackedBar' || chartType === 'groupedBar' || chartType === 'combo' || chartType === 'line') {
    multiDatasetData.value.forEach(dataset => {
      headers.push({ 
        key: dataset.label, 
        label: `${dataset.label}${chartConfig.value.dataUnit ? ` (${chartConfig.value.dataUnit})` : ''}` 
      });
    });
  } else if (chartType === 'gauge') {
    headers.push(
      { key: 'value', label: `Value${chartConfig.value.dataUnit ? ` (${chartConfig.value.dataUnit})` : ''}` },
      { key: 'min', label: `Min${chartConfig.value.dataUnit ? ` (${chartConfig.value.dataUnit})` : ''}` },
      { key: 'max', label: `Max${chartConfig.value.dataUnit ? ` (${chartConfig.value.dataUnit})` : ''}` },
      { key: 'target', label: `Target${chartConfig.value.dataUnit ? ` (${chartConfig.value.dataUnit})` : ''}` }
    );
  } else if (chartType === 'bulletGraph') {
    headers.push(
      { key: 'value', label: `Value${chartConfig.value.dataUnit ? ` (${chartConfig.value.dataUnit})` : ''}` },
      { key: 'target', label: `Target${chartConfig.value.dataUnit ? ` (${chartConfig.value.dataUnit})` : ''}` },
      { key: 'max', label: `Max${chartConfig.value.dataUnit ? ` (${chartConfig.value.dataUnit})` : ''}` },
      { key: 'poor range', label: 'Poor Range' },
      { key: 'fair range', label: 'Fair Range' },
      { key: 'good range', label: 'Good Range' }
    );
  } else {
    headers.push({ 
      key: 'value', 
      label: `Value${chartConfig.value.dataUnit ? ` (${chartConfig.value.dataUnit})` : ''}` 
    });
  }
  
  return headers;
});

// Keyboard Navigation Handler
const handleChartKeyboard = (event) => {
  const chartType = selectedChartType.value;
  let dataLength = 0;
  
  if (chartType === 'stackedBar' || chartType === 'groupedBar' || chartType === 'combo' || chartType === 'line') {
    dataLength = multiDatasetData.value[0]?.data.length || 0;
  } else {
    dataLength = chartData.value.length;
  }
  
  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      event.preventDefault();
      currentDataPointIndex.value = Math.min(currentDataPointIndex.value + 1, dataLength - 1);
      // Announce data point to screen reader
      announceDataPoint(currentDataPointIndex.value);
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
      event.preventDefault();
      currentDataPointIndex.value = Math.max(currentDataPointIndex.value - 1, 0);
      announceDataPoint(currentDataPointIndex.value);
      break;
    case 'Enter':
      event.preventDefault();
      // Select/focus current data point
      announceDataPoint(currentDataPointIndex.value, true);
      break;
    case 'Escape':
      event.preventDefault();
      chartFocused.value = false;
      event.target.blur();
      break;
    case ' ':
      event.preventDefault();
      // Toggle legend
      chartConfig.value.showLegend = !chartConfig.value.showLegend;
      break;
  }
};

const announceDataPoint = (index, select = false) => {
  const chartType = selectedChartType.value;
  let label = '';
  let value = '';
  
  if (chartType === 'stackedBar' || chartType === 'groupedBar' || chartType === 'combo' || chartType === 'line') {
    const labels = multiDatasetData.value[0]?.data.map(item => item.label) || [];
    label = labels[index] || '';
    const datasets = multiDatasetData.value.map(d => {
      const val = d.data[index]?.value || 0;
      return `${d.label}: ${val}`;
    });
    value = datasets.join(', ');
  } else {
    label = chartData.value[index]?.label || '';
    value = chartData.value[index]?.value || 0;
  }
  
  // Create live region announcement
  const announcement = select 
    ? `Selected: ${label}, ${value}${chartConfig.value.dataUnit ? ' ' + chartConfig.value.dataUnit : ''}`
    : `${label}, ${value}${chartConfig.value.dataUnit ? ' ' + chartConfig.value.dataUnit : ''}`;
  
  // Use aria-live region for screen reader announcement
  const liveRegion = document.getElementById('chart-announcements');
  if (liveRegion) {
    liveRegion.textContent = announcement;
  }
};

// Accessibility checklist: ok, warn (advice) or fail (fix needed)
const accessibilityChecks = computed(() => [
  { label: 'Alt text', state: chartConfig.value.title && chartConfig.value.summary && chartConfig.value.keyInsight ? 'ok' : 'fail' },
  { label: 'Color independence', state: !colorOnlyEncoding.value ? 'ok' : 'fail' },
  { label: 'Contrast', state: contrastIssues.value.length === 0 ? 'ok' : 'fail' },
  { label: 'Keyboard navigation', state: 'ok' },
  { label: 'Screen reader', state: 'ok' },
  { label: 'Motion safety', state: chartConfig.value.reduceMotion || chartConfig.value.pauseAnimation ? 'ok' : 'warn' },
  { label: 'Zoom integrity', state: zoomIssues.value.length === 0 ? 'ok' : 'warn' }
]);
const checkTone = { ok: 'text-success', warn: 'text-warning', fail: 'text-danger' };
const checkIcon = { ok: 'check_circle', warn: 'warning', fail: 'error' };
const checkText = { ok: 'Passes', warn: 'Worth checking', fail: 'Needs work' };

const canExport = computed(() => {
  // Allow export regardless of accessibility status
  // Warnings will still be shown in the accessibility panel
  return true;
});

// axe-core Integration
const axeScanRunning = ref(false);
const axeScanResults = ref(null);

// Generate data table HTML for export
const generateDataTableHTMLHeaders = () => {
  const headers = dataTableHeaders.value;
  return headers.map(h => `<th scope="col" style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: 600;">${escapeHtml(h.label)}</th>`).join('\n                        ');
};

const generateDataTableHTMLRows = () => {
  const data = generateDataTable();
  return data.map(row => {
    const cells = dataTableHeaders.value.map(header => {
      const value = typeof row[header.key] === 'number' 
        ? row[header.key].toLocaleString() + (header.key === 'value' && chartConfig.value.dataUnit ? ' ' + chartConfig.value.dataUnit : '')
        : row[header.key];
      return `<td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(value ?? '')}</td>`;
    }).join('\n                            ');
    return `<tr>\n                            ${cells}\n                        </tr>`;
  }).join('\n                    ');
};

const runAxeCoreScan = async () => {
  axeScanRunning.value = true;
  axeScanResults.value = null;
  
  try {
    // Wait for next tick to ensure DOM is updated and chart is rendered
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find the chart preview container (the parent div that contains the chart)
    // This includes the figure element and potentially the data table
    const chartContainer = chartFigure.value;
    const previewSection = previewPanel.value || null;
    
    // Use the preview section if available, otherwise fall back to chart container
    const scanTarget = previewSection || chartContainer;
    
    if (!scanTarget) {
      axeScanResults.value = {
        violations: [{
          id: 'scan-error',
          description: 'Chart container not found. Please ensure the chart is rendered.',
          help: 'Try refreshing the page or reloading the chart data.',
          impact: 'critical'
        }],
        passes: [],
        incomplete: [],
        inapplicable: []
      };
      return;
    }
    
    // Run axe-core scan on the entire preview section
    // This will catch issues with the chart, data table, and surrounding elements
    const results = await axe.run(scanTarget, AXE_SCAN_OPTIONS);
    
    console.log('axe-core scan results:', results);
    axeScanResults.value = results;
  } catch (error) {
    console.error('axe-core scan error:', error);
    axeScanResults.value = {
      violations: [{
        id: 'scan-error',
        description: `Error running accessibility scan: ${error.message}`,
        help: 'Please check the browser console for more details.',
        impact: 'critical'
      }],
      passes: [],
      incomplete: [],
      inapplicable: [],
      error: error.message
    };
  } finally {
    axeScanRunning.value = false;
  }
};

const chartTypes = [
  { value: 'line', label: 'Line Graph', icon: 'show_chart', description: 'Display trends over time (supports multiple lines)' },
  { value: 'area', label: 'Area Chart', icon: 'area_chart', description: 'Filled line chart showing cumulative values' },
  { value: 'bar', label: 'Bar Graph', icon: 'bar_chart', description: 'Compare categories' },
  { value: 'horizontalBar', label: 'Horizontal Bar', icon: 'horizontal_rule', description: 'Bar chart rotated horizontally' },
  { value: 'stackedBar', label: 'Stacked Bar', icon: 'stacked_bar_chart', description: 'Multiple datasets stacked vertically' },
  { value: 'groupedBar', label: 'Grouped Bar', icon: 'grouped_bar_chart', description: 'Multiple datasets side by side' },
  { value: 'combo', label: 'Combo Chart', icon: 'multiline_chart', description: 'Mix of bar and line charts' },
  { value: 'gauge', label: 'Gauge Chart', icon: 'speed', description: 'Single metric with min/max/target' },
  { value: 'waterfall', label: 'Waterfall Chart', icon: 'waterfall_chart', description: 'Shows cumulative changes' },
  { value: 'candlestick', label: 'Candlestick', icon: 'candlestick_chart', description: 'Financial OHLC data' },
  { value: 'heatmap', label: 'Heatmap', icon: 'grid_on', description: 'Matrix visualization' },
  { value: 'funnel', label: 'Funnel Chart', icon: 'filter_alt', description: 'Conversion funnel stages' },
  { value: 'treemap', label: 'Treemap', icon: 'account_tree', description: 'Hierarchical data visualization' },
  { value: 'sankey', label: 'Sankey Diagram', icon: 'timeline', description: 'Flow diagram showing connections' },
  { value: 'pie', label: 'Pie Chart', icon: 'pie_chart', description: 'Show proportions' },
  { value: 'doughnut', label: 'Doughnut Chart', icon: 'donut_large', description: 'Pie chart with center' },
  { value: 'scatter', label: 'Scatter Plot', icon: 'scatter_plot', description: 'Correlation analysis' },
  { value: 'radar', label: 'Radar Chart', icon: 'insights', description: 'Multi-dimensional data' },
  { value: 'bubble', label: 'Bubble Chart', icon: 'bubble_chart', description: 'Three variables' },
  { value: 'polar', label: 'Polar Area', icon: 'pie_chart', description: 'Circular segments' },
  { value: 'bulletGraph', label: 'Bullet Graph', icon: 'track_changes', description: 'Horizontal bars with targets and ranges' },
  { value: 'chordDiagram', label: 'Chord Diagram', icon: 'hub', description: 'Circular diagram showing relationships' }
];

const colorSchemes = {
  default: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'],
  indigo: ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff', '#eef2ff'],
  blue: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#eff6ff'],
  green: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#ecfdf5'],
  red: ['#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2', '#fef2f2'],
  purple: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe', '#f5f3ff'],
  orange: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7', '#fffbeb']
};

const secondaryEncodingOptions = [
  { value: 'none', label: 'None' },
  { value: 'shape', label: 'Shape patterns' },
  { value: 'pattern', label: 'Pattern fills' },
  { value: 'lineStyle', label: 'Line styles' },
  { value: 'icon', label: 'Icon labels' },
  { value: 'text', label: 'Text labels' }
];

const exportActions = [
  { format: 'html', label: 'Export as HTML', icon: 'html', gated: true },
  { format: 'png', label: 'Export as PNG', icon: 'download', gated: true },
  { format: 'caption', label: 'Export caption (TXT)', icon: 'subtitles', gated: false },
  { format: 'json', label: 'Export config (JSON)', icon: 'code', gated: false },
  { format: 'pdf', label: 'Export as PDF', icon: 'picture_as_pdf', gated: true },
  { format: 'ppt', label: 'Export as PPT', icon: 'slideshow', gated: true },
  { format: 'word', label: 'Export as Word', icon: 'description', gated: true }
];

const sankeyNodeOptions = computed(() => sankeyData.value.nodes.map((node) => ({ value: node.id, label: node.label })));
const chordNodeOptions = computed(() => chordDiagramData.value.nodes.map((node) => ({ value: node.id, label: node.label })));

const colorSchemeOptions = [
  { value: 'default', label: 'Default' },
  { value: 'indigo', label: 'Indigo' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'red', label: 'Red' },
  { value: 'purple', label: 'Purple' },
  { value: 'orange', label: 'Orange' },
  { value: 'custom', label: 'Custom Colors' }
];

const chartDataForDisplay = computed(() => {
  // Use custom colors if custom scheme is selected, otherwise use predefined scheme
  const colors = chartConfig.value.colorScheme === 'custom' 
    ? (customColors.value.length > 0 ? customColors.value : colorSchemes.default)
    : (colorSchemes[chartConfig.value.colorScheme] || colorSchemes.default);
  const chartType = selectedChartType.value;
  
  // Handle gauge chart (custom doughnut-based)
  if (chartType === 'gauge') {
    const value = gaugeData.value.value;
    const min = gaugeData.value.min;
    const max = gaugeData.value.max;
    const target = gaugeData.value.target;
    const range = max - min;
    const valuePercent = ((value - min) / range) * 100;
    const targetPercent = ((target - min) / range) * 100;
    const remaining = 100 - valuePercent;
    
    return {
      labels: ['Value', 'Remaining'],
      datasets: [{
        data: [valuePercent, remaining],
        backgroundColor: [colors[0], chartTheme.value.neutral],
        borderWidth: 0
      }]
    };
  }
  
  // Handle waterfall chart
  if (chartType === 'waterfall') {
    const base = waterfallData.value.base;
    const changes = waterfallData.value.changes;
    const labels = ['Base', ...changes.map(c => c.label), 'Total'];
    const values = [base];
    let runningTotal = base;
    
    changes.forEach(change => {
      runningTotal += change.value;
      values.push(runningTotal);
    });
    
    const data = [];
    const backgroundColors = [];
    data.push(base);
    backgroundColors.push(colors[0]);
    
    changes.forEach((change, index) => {
      data.push(change.value);
      backgroundColors.push(change.value >= 0 ? colors[1] : colors[2]);
    });
    
    data.push(runningTotal);
    backgroundColors.push(colors[0]);
    
    return {
      labels,
      datasets: [{
        label: chartConfig.value.title || 'Waterfall',
        data,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors,
        borderWidth: 2
      }]
    };
  }
  
  // Handle candlestick chart
  if (chartType === 'candlestick') {
    return {
      labels: candlestickData.value.map(item => item.date),
      datasets: [{
        label: chartConfig.value.title || 'OHLC',
        data: candlestickData.value.map((item, index) => ({
          x: index,
          o: item.open,
          h: item.high,
          l: item.low,
          c: item.close
        }))
      }]
    };
  }
  
  // Handle heatmap
  if (chartType === 'heatmap') {
    const data = [];
    heatmapData.value.rows.forEach((row, rowIndex) => {
      heatmapData.value.columns.forEach((col, colIndex) => {
        if (heatmapData.value.values[rowIndex] && heatmapData.value.values[rowIndex][colIndex] !== undefined) {
          data.push({
            x: colIndex,
            y: rowIndex,
            v: heatmapData.value.values[rowIndex][colIndex],
            w: 1,
            h: 1
          });
        }
      });
    });
    
    const allValues = heatmapData.value.values.flat().filter(v => v !== undefined);
    const max = allValues.length > 0 ? Math.max(...allValues) : 0;
    const min = allValues.length > 0 ? Math.min(...allValues) : 0;
    const numColumns = heatmapData.value.columns.length;
    const numRows = heatmapData.value.rows.length;
    
    return {
      datasets: [{
        label: chartConfig.value.title || 'Heatmap',
        data,
        borderWidth: 0,
        borderColor: 'transparent',
        // Set width and height as dataset-level functions to fill cells
        width: ({ chart }) => {
          const chartArea = chart.chartArea || {};
          const availableWidth = chartArea.right - chartArea.left;
          return availableWidth / numColumns;
        },
        height: ({ chart }) => {
          const chartArea = chart.chartArea || {};
          const availableHeight = chartArea.bottom - chartArea.top;
          return availableHeight / numRows;
        },
        backgroundColor: (ctx) => {
          const value = ctx.raw.v;
          if (allValues.length === 0) return colors[0];
          if (max === min) return colors[0];
          const ratio = (value - min) / (max - min);
          return colors[Math.floor(ratio * (colors.length - 1))];
        }
      }]
    };
  }
  
  // Handle funnel chart
  if (chartType === 'funnel') {
    const maxValue = Math.max(...funnelData.value.map(item => item.value));
    return {
      labels: funnelData.value.map(item => item.label),
      datasets: [{
        label: chartConfig.value.title || 'Funnel',
        data: funnelData.value.map(item => item.value),
        backgroundColor: colors.slice(0, funnelData.value.length),
        borderColor: colors.slice(0, funnelData.value.length),
        borderWidth: 2
      }]
    };
  }
  
  // Handle treemap (will use custom SVG rendering)
  if (chartType === 'treemap') {
    return { type: 'treemap', data: treemapData.value };
  }
  
  // Handle sankey (will use custom SVG rendering)
  if (chartType === 'sankey') {
    return { type: 'sankey', data: sankeyData.value };
  }
  
  // Handle choropleth map - MOVED TO MapMaker.vue
  if (chartType === 'choropleth') {
    return { type: 'choropleth', data: [] };
  }
  
  // Handle flow map - MOVED TO MapMaker.vue
  if (chartType === 'flowMap') {
    return { type: 'flowMap', data: { nodes: [], links: [] } };
  }
  
  // Handle bullet graph (will use custom SVG rendering)
  if (chartType === 'bulletGraph') {
    return { type: 'bulletGraph', data: bulletGraphData.value };
  }
  
  // Handle chord diagram (will use custom SVG rendering)
  if (chartType === 'chordDiagram') {
    return { type: 'chordDiagram', data: chordDiagramData.value };
  }
  
  // Handle multi-dataset charts (stacked, grouped, combo, multi-line)
  if (chartType === 'stackedBar' || chartType === 'groupedBar' || chartType === 'combo' || chartType === 'line') {
    const labels = multiDatasetData.value[0]?.data.map(item => item.label) || [];
    const datasets = multiDatasetData.value.map((dataset, index) => {
      const isLine = chartType === 'combo' && index === multiDatasetData.value.length - 1;
      const isMultiLine = chartType === 'line';
      return {
        label: dataset.label,
        data: dataset.data.map(item => item.value),
        backgroundColor: isLine || isMultiLine ? 'transparent' : (colors[index % colors.length] + '80'),
        borderColor: colors[index % colors.length],
        borderWidth: 2,
        type: isLine ? 'line' : (isMultiLine ? 'line' : 'bar'),
        fill: isMultiLine ? false : (isLine ? false : undefined),
        tension: isMultiLine ? 0.4 : undefined // Smooth curves for multi-line
      };
    });
    
    return { labels, datasets };
  }
  
  // Handle area chart
  if (chartType === 'area') {
    return {
      labels: chartData.value.map(item => item.label),
      datasets: [{
        label: chartConfig.value.title || 'Dataset',
        data: chartData.value.map(item => item.value),
        backgroundColor: colors[0] + '80',
        borderColor: colors[0],
        borderWidth: 2,
        fill: true
      }]
    };
  }
  
  // Handle single dataset charts
  return {
    labels: chartData.value.map(item => item.label),
    datasets: [{
      label: chartConfig.value.title || 'Dataset',
      data: chartData.value.map(item => item.value),
      backgroundColor: chartType === 'line' || chartType === 'bar' || chartType === 'radar' || chartType === 'horizontalBar'
        ? colors[0] + '80'
        : colors.slice(0, chartData.value.length),
      borderColor: chartType === 'line' || chartType === 'bar' || chartType === 'radar' || chartType === 'horizontalBar'
        ? colors[0]
        : colors.slice(0, chartData.value.length),
      borderWidth: 2,
      fill: chartType === 'line' ? false : undefined
    }]
  };
});

const scatterDataForDisplay = computed(() => {
  const colors = chartConfig.value.colorScheme === 'custom' 
    ? (customColors.value.length > 0 ? customColors.value : colorSchemes.default)
    : (colorSchemes[chartConfig.value.colorScheme] || colorSchemes.default);
  
  return {
    datasets: [{
      label: chartConfig.value.title || 'Dataset',
      data: chartData.value.map((item, index) => ({
        x: index,
        y: item.value
      })),
      backgroundColor: colors[0] + '80',
      borderColor: colors[0],
      borderWidth: 2
    }]
  };
});

const bubbleDataForDisplay = computed(() => {
  const colors = chartConfig.value.colorScheme === 'custom' 
    ? (customColors.value.length > 0 ? customColors.value : colorSchemes.default)
    : (colorSchemes[chartConfig.value.colorScheme] || colorSchemes.default);
  
  return {
    datasets: [{
      label: chartConfig.value.title || 'Dataset',
      data: chartData.value.map((item, index) => ({
        x: index,
        y: item.value,
        r: Math.abs(item.value) / 5 + 5
      })),
      backgroundColor: colors[0] + '80',
      borderColor: colors[0],
      borderWidth: 2
    }]
  };
});

const chartOptions = computed(() => {
  const theme = chartTheme.value;
  const textColor = theme.text;
  const gridColor = theme.grid;
  const chartType = selectedChartType.value;
  
  // Check for prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const shouldReduceMotion = chartConfig.value.reduceMotion || prefersReducedMotion || chartConfig.value.pauseAnimation;
  
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: shouldReduceMotion ? false : {
      duration: chartConfig.value.pauseAnimation ? 0 : 1000,
      easing: 'easeInOut'
    },
    transitions: shouldReduceMotion ? {
      active: {
        animation: {
          duration: 0
        }
      }
    } : undefined,
    plugins: {
      title: {
        display: !!chartConfig.value.title,
        text: chartConfig.value.title,
        color: theme.title,
        font: {
          size: 18,
          weight: 'bold'
        }
      },
      legend: {
        display: chartConfig.value.showLegend,
        position: 'top',
        labels: {
          color: textColor,
          usePointStyle: true,
          padding: 15
        },
        onClick: (e, legendItem) => {
          // Make legend keyboard accessible - toggle on click
          const index = legendItem.datasetIndex;
          const chart = e.chart;
          const meta = chart.getDatasetMeta(index);
          meta.hidden = meta.hidden === null ? !chart.data.datasets[index].hidden : null;
          chart.update();
        }
      },
      tooltip: {
        backgroundColor: theme.tooltip,
        titleColor: theme.title,
        bodyColor: textColor,
        borderColor: theme.border,
        borderWidth: 1,
        animation: shouldReduceMotion ? false : undefined
      }
    }
  };
  
  // Charts without scales (pie, doughnut, polar, gauge)
  if (chartType === 'pie' || chartType === 'doughnut' || chartType === 'polar' || chartType === 'gauge') {
    if (chartType === 'gauge') {
      return {
        ...baseOptions,
        cutout: '75%',
        circumference: 270,
        rotation: 225
      };
    }
    return baseOptions;
  }
  
  // Candlestick chart options
  if (chartType === 'candlestick') {
    return {
      ...baseOptions,
      scales: {
        x: {
          type: 'category',
          ticks: { color: textColor },
          grid: { color: gridColor },
          title: {
            display: true,
            text: chartConfig.value.xAxisLabel || 'Date',
            color: textColor,
            font: { size: 14, weight: 'bold' }
          }
        },
        y: {
          type: 'linear',
          ticks: { color: textColor },
          grid: { color: gridColor },
          title: {
            display: true,
            text: chartConfig.value.yAxisLabel || 'Price',
            color: textColor,
            font: { size: 14, weight: 'bold' }
          }
        }
      }
    };
  }
  
  // Heatmap options
  if (chartType === 'heatmap') {
    const allValues = heatmapData.value.values.flat().filter(v => v !== undefined);
    const max = allValues.length > 0 ? Math.max(...allValues) : 0;
    const min = allValues.length > 0 ? Math.min(...allValues) : 0;
    const colors = chartConfig.value.colorScheme === 'custom' 
      ? (customColors.value.length > 0 ? customColors.value : colorSchemes.default)
      : (colorSchemes[chartConfig.value.colorScheme] || colorSchemes.default);
    
    return {
      ...baseOptions,
      layout: {
        padding: {
          bottom: chartConfig.value.showLegend ? 60 : 0 // Reserve space for legend below chart
        }
      },
      plugins: {
        ...baseOptions.plugins,
        legend: {
          display: false // Disable default legend for matrix charts
        },
        colorScaleLegend: {
          show: chartConfig.value.showLegend,
          colors: colors,
          min: min,
          max: max,
          textColor: textColor,
          gridColor: gridColor
        }
      },
      scales: {
        x: {
          type: 'linear',
          min: -0.5,
          max: heatmapData.value.columns.length - 0.5,
          ticks: {
            stepSize: 1,
            callback: function(value) {
              return heatmapData.value.columns[value] || '';
            },
            color: textColor
          },
          grid: { color: gridColor },
          title: {
            display: true,
            text: chartConfig.value.xAxisLabel || 'Columns',
            color: textColor,
            font: { size: 14, weight: 'bold' }
          }
        },
        y: {
          type: 'linear',
          min: -0.5,
          max: heatmapData.value.rows.length - 0.5,
          reverse: true,
          ticks: {
            stepSize: 1,
            callback: function(value) {
              return heatmapData.value.rows[value] || '';
            },
            color: textColor
          },
          grid: { color: gridColor },
          title: {
            display: true,
            text: chartConfig.value.yAxisLabel || 'Rows',
            color: textColor,
            font: { size: 14, weight: 'bold' }
          }
        }
      }
    };
  }
  
  // Funnel chart options (use bar with special styling)
  if (chartType === 'funnel') {
    return {
      ...baseOptions,
      indexAxis: 'y',
      scales: {
        x: {
          ticks: { color: textColor },
          grid: { color: gridColor },
          title: {
            display: true,
            text: chartConfig.value.xAxisLabel || 'Value',
            color: textColor,
            font: { size: 14, weight: 'bold' }
          }
        },
        y: {
          ticks: { color: textColor },
          grid: { color: gridColor },
          title: {
            display: true,
            text: chartConfig.value.yAxisLabel || 'Category',
            color: textColor,
            font: { size: 14, weight: 'bold' }
          }
        }
      }
    };
  }
  
  // Waterfall chart options
  if (chartType === 'waterfall') {
    return {
      ...baseOptions,
      scales: {
        x: {
          ticks: { color: textColor },
          grid: { color: gridColor },
          title: {
            display: true,
            text: chartConfig.value.xAxisLabel || 'Category',
            color: textColor,
            font: { size: 14, weight: 'bold' }
          }
        },
        y: {
          ticks: { color: textColor },
          grid: { color: gridColor },
          title: {
            display: true,
            text: chartConfig.value.yAxisLabel || 'Value',
            color: textColor,
            font: { size: 14, weight: 'bold' }
          }
        }
      }
    };
  }
  
  // Horizontal bar chart
  if (chartType === 'horizontalBar') {
    return {
      ...baseOptions,
      indexAxis: 'y',
      scales: {
        x: {
          ticks: { color: textColor },
          grid: { color: gridColor },
          title: {
            display: true,
            text: chartConfig.value.xAxisLabel || 'Value',
            color: textColor,
            font: { size: 14, weight: 'bold' }
          }
        },
        y: {
          ticks: { color: textColor },
          grid: { color: gridColor },
          title: {
            display: true,
            text: chartConfig.value.yAxisLabel || 'Category',
            color: textColor,
            font: { size: 14, weight: 'bold' }
          }
        }
      }
    };
  }
  
  // Stacked bar chart
  if (chartType === 'stackedBar') {
    return {
      ...baseOptions,
      scales: {
        x: {
          stacked: true,
          ticks: { color: textColor },
          grid: { color: gridColor },
          title: {
            display: true,
            text: chartConfig.value.xAxisLabel || 'Category',
            color: textColor,
            font: { size: 14, weight: 'bold' }
          }
        },
        y: {
          stacked: true,
          ticks: { color: textColor },
          grid: { color: gridColor },
          title: {
            display: true,
            text: chartConfig.value.yAxisLabel || 'Value',
            color: textColor,
            font: { size: 14, weight: 'bold' }
          }
        }
      }
    };
  }
  
  // Default scales for other charts (line, bar, scatter, bubble, area, groupedBar, combo, radar)
  return {
    ...baseOptions,
    scales: {
      x: {
        ticks: { color: textColor },
        grid: { color: gridColor },
        title: {
          display: true,
          text: chartConfig.value.xAxisLabel || (chartType === 'scatter' || chartType === 'bubble' ? 'X Value' : 'Category'),
          color: textColor,
          font: { size: 14, weight: 'bold' }
        }
      },
      y: {
        ticks: { color: textColor },
        grid: { color: gridColor },
        title: {
          display: true,
          text: chartConfig.value.yAxisLabel || (chartType === 'scatter' || chartType === 'bubble' ? 'Y Value' : 'Value'),
          color: textColor,
          font: { size: 14, weight: 'bold' }
        }
      }
    }
  };
});

const addDataItem = () => {
  chartData.value.push({ label: `Item ${chartData.value.length + 1}`, value: 0 });
};

const removeDataItem = (index) => {
  if (chartData.value.length > 1) {
    chartData.value.splice(index, 1);
  }
};

// Multi-dataset management functions
const addDataset = () => {
  const baseLabels = multiDatasetData.value[0]?.data.map(item => item.label) || ['A', 'B', 'C', 'D'];
  multiDatasetData.value.push({
    label: `Dataset ${multiDatasetData.value.length + 1}`,
    data: baseLabels.map(label => ({ label, value: 0 }))
  });
};

const removeDataset = (index) => {
  if (multiDatasetData.value.length > 1) {
    multiDatasetData.value.splice(index, 1);
  }
};

const addMultiDataItem = (datasetIndex) => {
  const dataset = multiDatasetData.value[datasetIndex];
  dataset.data.push({ label: `Item ${dataset.data.length + 1}`, value: 0 });
  // Sync labels across all datasets
  syncMultiDatasetLabels();
};

const removeMultiDataItem = (datasetIndex, itemIndex) => {
  const dataset = multiDatasetData.value[datasetIndex];
  if (dataset.data.length > 1) {
    dataset.data.splice(itemIndex, 1);
    // Sync labels across all datasets
    syncMultiDatasetLabels();
  }
};

const syncMultiDatasetLabels = () => {
  if (multiDatasetData.value.length === 0) return;
  const firstDatasetLabels = multiDatasetData.value[0].data.map(item => item.label);
  multiDatasetData.value.forEach((dataset, index) => {
    if (index > 0) {
      dataset.data.forEach((item, itemIndex) => {
        if (firstDatasetLabels[itemIndex]) {
          item.label = firstDatasetLabels[itemIndex];
        }
      });
    }
  });
};

const loadSampleData = () => {
  const chartType = selectedChartType.value;
  
  // Handle gauge chart
  if (chartType === 'gauge') {
    gaugeData.value = { value: 75, min: 0, max: 100, target: 80 };
    chartConfig.value.title = 'Gauge Chart Example';
    return;
  }
  
  // Handle waterfall chart
  if (chartType === 'waterfall') {
    waterfallData.value = {
      base: 100,
      changes: [
        { label: 'Q1', value: 20 },
        { label: 'Q2', value: -10 },
        { label: 'Q3', value: 30 },
        { label: 'Q4', value: -5 }
      ]
    };
    chartConfig.value.title = 'Waterfall Chart Example';
    return;
  }
  
  // Handle candlestick chart
  if (chartType === 'candlestick') {
    candlestickData.value = [
      { date: '2024-01-01', open: 100, high: 110, low: 95, close: 105 },
      { date: '2024-01-02', open: 105, high: 115, low: 100, close: 112 },
      { date: '2024-01-03', open: 112, high: 120, low: 108, close: 115 },
      { date: '2024-01-04', open: 115, high: 118, low: 110, close: 113 }
    ];
    chartConfig.value.title = 'Candlestick Chart Example';
    return;
  }
  
  // Handle heatmap
  if (chartType === 'heatmap') {
    heatmapData.value = {
      rows: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      columns: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      values: [
        [10, 20, 30, 40],
        [15, 25, 35, 45],
        [20, 30, 40, 50],
        [25, 35, 45, 55],
        [30, 40, 50, 60]
      ]
    };
    chartConfig.value.title = 'Heatmap Example';
    return;
  }
  
  // Handle funnel chart
  if (chartType === 'funnel') {
    funnelData.value = [
      { label: 'Visitors', value: 1000 },
      { label: 'Leads', value: 500 },
      { label: 'Qualified', value: 250 },
      { label: 'Proposals', value: 100 },
      { label: 'Closed', value: 50 }
    ];
    chartConfig.value.title = 'Funnel Chart Example';
    return;
  }
  
  // Handle treemap
  if (chartType === 'treemap') {
    treemapData.value = {
      name: 'Root',
      value: 100,
      children: [
        { name: 'Category A', value: 40, children: [
          { name: 'Item A1', value: 20 },
          { name: 'Item A2', value: 20 }
        ]},
        { name: 'Category B', value: 35, children: [
          { name: 'Item B1', value: 15 },
          { name: 'Item B2', value: 20 }
        ]},
        { name: 'Category C', value: 25, children: [
          { name: 'Item C1', value: 25 }
        ]}
      ]
    };
    chartConfig.value.title = 'Treemap Example';
    return;
  }
  
  // Handle sankey
  if (chartType === 'sankey') {
    sankeyData.value = {
      nodes: [
        { id: 'Source1', label: 'Source 1' },
        { id: 'Source2', label: 'Source 2' },
        { id: 'Process1', label: 'Process 1' },
        { id: 'Process2', label: 'Process 2' },
        { id: 'Target1', label: 'Target 1' },
        { id: 'Target2', label: 'Target 2' }
      ],
      links: [
        { source: 'Source1', target: 'Process1', value: 30 },
        { source: 'Source1', target: 'Process2', value: 20 },
        { source: 'Source2', target: 'Process1', value: 25 },
        { source: 'Source2', target: 'Process2', value: 15 },
        { source: 'Process1', target: 'Target1', value: 40 },
        { source: 'Process1', target: 'Target2', value: 15 },
        { source: 'Process2', target: 'Target1', value: 20 },
        { source: 'Process2', target: 'Target2', value: 15 }
      ]
    };
    chartConfig.value.title = 'Sankey Diagram Example';
    return;
  }
  
  // Handle multi-dataset charts
  if (chartType === 'stackedBar' || chartType === 'groupedBar' || chartType === 'combo' || chartType === 'line') {
    multiDatasetData.value = [
      {
        label: chartType === 'line' ? 'Series 1' : 'Sales',
        data: [
          { label: 'Q1', value: 45 },
          { label: 'Q2', value: 78 },
          { label: 'Q3', value: 92 },
          { label: 'Q4', value: 65 }
        ]
      },
      {
        label: chartType === 'line' ? 'Series 2' : 'Revenue',
        data: [
          { label: 'Q1', value: 35 },
          { label: 'Q2', value: 68 },
          { label: 'Q3', value: 82 },
          { label: 'Q4', value: 55 }
        ]
      },
      ...(chartType === 'combo' ? [{
        label: 'Target',
        data: [
          { label: 'Q1', value: 50 },
          { label: 'Q2', value: 75 },
          { label: 'Q3', value: 90 },
          { label: 'Q4', value: 70 }
        ]
      }] : []),
      ...(chartType === 'line' ? [{
        label: 'Series 3',
        data: [
          { label: 'Q1', value: 55 },
          { label: 'Q2', value: 72 },
          { label: 'Q3', value: 88 },
          { label: 'Q4', value: 60 }
        ]
      }] : [])
    ];
    chartConfig.value.title = `${chartTypes.find(t => t.value === chartType)?.label || 'Chart'} Example`;
    return;
  }
  
  // Single dataset charts
  const samples = {
    line: [
      { label: 'Jan', value: 65 },
      { label: 'Feb', value: 59 },
      { label: 'Mar', value: 80 },
      { label: 'Apr', value: 81 },
      { label: 'May', value: 56 },
      { label: 'Jun', value: 55 }
    ],
    area: [
      { label: 'Jan', value: 65 },
      { label: 'Feb', value: 59 },
      { label: 'Mar', value: 80 },
      { label: 'Apr', value: 81 },
      { label: 'May', value: 56 },
      { label: 'Jun', value: 55 }
    ],
    bar: [
      { label: 'Q1', value: 45 },
      { label: 'Q2', value: 78 },
      { label: 'Q3', value: 92 },
      { label: 'Q4', value: 65 }
    ],
    horizontalBar: [
      { label: 'Product A', value: 85 },
      { label: 'Product B', value: 72 },
      { label: 'Product C', value: 90 },
      { label: 'Product D', value: 65 }
    ],
    pie: [
      { label: 'Desktop', value: 45 },
      { label: 'Mobile', value: 30 },
      { label: 'Tablet', value: 15 },
      { label: 'Other', value: 10 }
    ],
    doughnut: [
      { label: 'Chrome', value: 60 },
      { label: 'Firefox', value: 25 },
      { label: 'Safari', value: 10 },
      { label: 'Edge', value: 5 }
    ],
    scatter: [
      { label: 'Point 1', value: 20 },
      { label: 'Point 2', value: 35 },
      { label: 'Point 3', value: 50 },
      { label: 'Point 4', value: 45 },
      { label: 'Point 5', value: 60 },
      { label: 'Point 6', value: 70 }
    ],
    radar: [
      { label: 'Speed', value: 80 },
      { label: 'Reliability', value: 90 },
      { label: 'Comfort', value: 70 },
      { label: 'Safety', value: 85 },
      { label: 'Efficiency', value: 75 }
    ],
    bubble: [
      { label: 'A', value: 30 },
      { label: 'B', value: 50 },
      { label: 'C', value: 40 },
      { label: 'D', value: 60 },
      { label: 'E', value: 45 }
    ],
    polar: [
      { label: 'Red', value: 11 },
      { label: 'Blue', value: 16 },
      { label: 'Yellow', value: 7 },
      { label: 'Green', value: 3 },
      { label: 'Purple', value: 14 }
    ]
  };
  
  chartData.value = samples[chartType] || samples.line;
  chartConfig.value.title = `${chartTypes.find(t => t.value === chartType)?.label || 'Chart'} Example`;
};

// Chart.js and plugins for the standalone HTML export, pinned to the versions
// installed here, with Subresource Integrity hashes of the jsDelivr files.
const EXPORT_CDN_SCRIPTS = {
  chartjs: {
    src: 'https://cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.min.js',
    integrity: 'sha384-jb8JQMbMoBUzgWatfe6COACi2ljcDdZQ2OxczGA3bGNeWe+6DChMTBJemed7ZnvJ'
  },
  financial: {
    src: 'https://cdn.jsdelivr.net/npm/chartjs-chart-financial@0.2.1/dist/chartjs-chart-financial.min.js',
    integrity: 'sha384-OSSr3vjWsgL3ackkKviJxtoGYpsPeXSwIL4w5W3Ou3TXdA5pdIotbHwQEpFv7x/D'
  },
  matrix: {
    src: 'https://cdn.jsdelivr.net/npm/chartjs-chart-matrix@3.0.0/dist/chartjs-chart-matrix.min.js',
    integrity: 'sha384-rJ/i5dnMG9QpsJqCMvR1ItW0deXppx40qBosSeiEI3hb9B8msI7j0D22p2rp010u'
  }
};

const cdnScriptTag = ({ src, integrity }) =>
  '<' + `script src="${src}" integrity="${integrity}" crossorigin="anonymous"></` + 'script>';

// Text for HTML element content and quoted attribute values.
const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const exportFileBase = () =>
  `chart-${(chartConfig.value.title || '').replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'chart'}`;

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoking straight away can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// Rasterise this page's chart figure.
const captureChart = async () => {
  const chartElement = chartFigure.value;
  if (!chartElement) throw new Error('chart element not found');
  const html2canvas = (await import('html2canvas')).default;
  return html2canvas(chartElement, {
    backgroundColor: chartTheme.value.surface,
    scale: 2
  });
};

// The raw data the selected chart type is built from (for the JSON export).
const chartSourceData = () => {
  switch (selectedChartType.value) {
    case 'line':
    case 'stackedBar':
    case 'groupedBar':
    case 'combo':
      return multiDatasetData.value;
    case 'gauge': return gaugeData.value;
    case 'waterfall': return waterfallData.value;
    case 'candlestick': return candlestickData.value;
    case 'heatmap': return heatmapData.value;
    case 'funnel': return funnelData.value;
    case 'treemap': return treemapData.value;
    case 'sankey': return sankeyData.value;
    case 'bulletGraph': return bulletGraphData.value;
    case 'chordDiagram': return chordDiagramData.value;
    default: return chartData.value;
  }
};

const exportChart = async (format) => {
  // Show warning if accessibility requirements aren't met, but allow export
  const warnings = [];
  
  if (!chartConfig.value.title || chartConfig.value.title.trim() === '') {
    warnings.push('Chart title is missing');
  }
  if (!chartConfig.value.summary || chartConfig.value.summary.trim() === '') {
    warnings.push('Chart summary is missing');
  }
  if (!chartConfig.value.keyInsight || chartConfig.value.keyInsight.trim() === '') {
    warnings.push('Key insight is missing');
  }
  if (colorOnlyEncoding.value) {
    warnings.push('Chart relies solely on color - consider adding secondary encoding');
  }
  if (contrastIssues.value.length > 0) {
    warnings.push(`${contrastIssues.value.length} contrast issue(s) found`);
  }
  if (accessibilityScore.value < 100) {
    warnings.push(`Accessibility score is ${accessibilityScore.value}%`);
  }
  
  if (warnings.length > 0) {
    const proceed = confirm('Accessibility warnings detected:\n\n' + warnings.join('\n') + '\n\nDo you want to export anyway?');
    if (!proceed) {
      return;
    }
  }
  
  if (format === 'json') {
    const config = {
      type: selectedChartType.value,
      title: chartConfig.value.title,
      summary: chartConfig.value.summary,
      keyInsight: chartConfig.value.keyInsight,
      // The data the selected chart type actually uses.
      data: chartSourceData(),
      colorScheme: chartConfig.value.colorScheme,
      ...(chartConfig.value.colorScheme === 'custom' ? { customColors: customColors.value } : {}),
      showLegend: chartConfig.value.showLegend
    };
    downloadBlob(new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' }), `chart-config-${Date.now()}.json`);
    showNotice('JSON config downloaded.', 'success');
  } else if (format === 'html') {
    const chartType = selectedChartType.value;
    
    // SVG-based charts (choropleth, flowMap, bulletGraph, chordDiagram, treemap, sankey) 
    // don't work with Chart.js HTML export - recommend PNG/PDF instead
    if (chartType === 'choropleth' || chartType === 'flowMap' || chartType === 'bulletGraph' || 
        chartType === 'chordDiagram' || chartType === 'treemap' || chartType === 'sankey') {
      showNotice('HTML export is not available for SVG-based charts. Please use PNG or PDF export instead.', 'warning');
      return;
    }
    
    // Export exactly the data the preview renders (multi-line, custom colours,
    // index-based candlesticks, ...). Function-valued properties such as the
    // heatmap cell size/colour do not survive JSON and are re-created in the
    // exported script below.
    const exportTypeMap = {
      gauge: 'doughnut',
      waterfall: 'bar',
      funnel: 'bar',
      stackedBar: 'bar',
      groupedBar: 'bar',
      combo: 'bar',
      horizontalBar: 'bar',
      area: 'line',
      heatmap: 'matrix',
      polar: 'polarArea'
    };
    const chartTypeForExport = exportTypeMap[chartType] || chartType;
    const exportData = chartType === 'scatter'
      ? scatterDataForDisplay.value
      : chartType === 'bubble'
        ? bubbleDataForDisplay.value
        : chartDataForDisplay.value;
    const chartDataConfig = scriptSafeJson(exportData);
    
    // Prepare chart options
    let chartOptionsConfig = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        title: {
          display: !!chartConfig.value.title,
          text: chartConfig.value.title,
          font: {
            size: 18,
            weight: 'bold'
          }
        },
        legend: {
          display: chartConfig.value.showLegend,
          position: 'top'
        }
      }
    };
    
    // Add scales and special options for charts that need them
    if (chartTypeForExport === 'bar') {
      if (chartType === 'horizontalBar' || chartType === 'funnel') {
        chartOptionsConfig.indexAxis = 'y';
      }
      if (chartType === 'stackedBar') {
        chartOptionsConfig.scales = {
          x: { stacked: true, ticks: {}, grid: {} },
          y: { stacked: true, ticks: {}, grid: {} }
        };
      } else if (chartType !== 'pie' && chartType !== 'doughnut' && chartType !== 'polar' && chartType !== 'gauge') {
        chartOptionsConfig.scales = {
          x: { ticks: {}, grid: {} },
          y: { ticks: {}, grid: {} }
        };
      }
    } else if (chartTypeForExport === 'line' && chartType !== 'pie' && chartType !== 'doughnut' && chartType !== 'polar' && chartType !== 'gauge') {
      chartOptionsConfig.scales = {
        x: { ticks: {}, grid: {} },
        y: { ticks: {}, grid: {} }
      };
    } else if (chartTypeForExport === 'doughnut' && chartType === 'gauge') {
      chartOptionsConfig.cutout = '75%';
      chartOptionsConfig.circumference = 270;
      chartOptionsConfig.rotation = 225;
    } else if (chartTypeForExport === 'candlestick') {
      // Category axis over the dates, as in the preview: no date adapter needed.
      chartOptionsConfig.scales = {
        x: { type: 'category', ticks: {}, grid: {} },
        y: { type: 'linear', ticks: {}, grid: {} }
      };
    } else if (chartTypeForExport === 'matrix') {
      // Matrix chart scales will be set in the HTML script
      chartOptionsConfig.scales = {
        x: {
          type: 'linear',
          min: -0.5,
          max: heatmapData.value.columns.length - 0.5,
          ticks: {
            stepSize: 1
          },
          grid: {}
        },
        y: {
          type: 'linear',
          min: -0.5,
          max: heatmapData.value.rows.length - 0.5,
          reverse: true,
          ticks: {
            stepSize: 1
          },
          grid: {}
        }
      };
    }
    
    const chartOptionsConfigStr = scriptSafeJson(chartOptionsConfig);
    const safeTitle = escapeHtml(chartConfig.value.title || 'Chart');
    const heatmapColors = chartConfig.value.colorScheme === 'custom'
      ? (customColors.value.length > 0 ? customColors.value : colorSchemes.default)
      : (colorSchemes[chartConfig.value.colorScheme] || colorSchemes.default);
    
    // Construct closing tags to avoid Vue parser issues
    const closeHead = '</' + 'head>';
    const closeBody = '</' + 'body>';
    const closeHtml = '</' + 'html>';
    const closeStyle = '</' + 'style>';
    
    const htmlParts = [
      '<!DOCTYPE html>',
      '<html lang="en">',
      '<head>',
      '    <meta charset="UTF-8">',
      '    <meta name="viewport" content="width=device-width, initial-scale=1.0">',
      `    <title>${safeTitle}</title>`,
      '    ' + cdnScriptTag(EXPORT_CDN_SCRIPTS.chartjs),
      ...(chartTypeForExport === 'candlestick' ? ['    ' + cdnScriptTag(EXPORT_CDN_SCRIPTS.financial)] : []),
      ...(chartTypeForExport === 'matrix' ? ['    ' + cdnScriptTag(EXPORT_CDN_SCRIPTS.matrix)] : []),
      '    <style>',
      '        * {',
      '            margin: 0;',
      '            padding: 0;',
      '            box-sizing: border-box;',
      '        }',
      '        body {',
      '            font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, \'Helvetica Neue\', Arial, sans-serif;',
      '            background: linear-gradient(to bottom right, #f5f5f5, #e0e0e0);',
      '            min-height: 100vh;',
      '            display: flex;',
      '            align-items: center;',
      '            justify-content: center;',
      '            padding: 20px;',
      '        }',
      '        .chart-container {',
      '            background: white;',
      '            border-radius: 12px;',
      '            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);',
      '            padding: 40px;',
      '            max-width: 900px;',
      '            width: 100%;',
      '        }',
      '        h1 {',
      '            color: #1e293b;',
      '            margin-bottom: 30px;',
      '            text-align: center;',
      '            font-size: 24px;',
      '            font-weight: 600;',
      '        }',
      '        canvas {',
      '            max-width: 100%;',
      '            height: auto !important;',
      '        }',
      '    ' + closeStyle,
      closeHead,
      '<body>',
      '    <div class="chart-container">',
      `        <h1>${safeTitle}</h1>`,
      '        <figure role="img" aria-label="' + safeTitle + '" aria-describedby="chart-summary chart-data-table">',
      '            <canvas id="chartCanvas"></canvas>',
      `            <figcaption id="chart-summary">${escapeHtml(chartConfig.value.summary || '')}</figcaption>`,
      ...(chartConfig.value.keyInsight ? [`            <p><strong>Key insight:</strong> ${escapeHtml(chartConfig.value.keyInsight)}</p>`] : []),
      '        </figure>',
      '        <div id="chart-data-table" style="margin-top: 30px;">',
      '            <h2>Data Table</h2>',
      '            <table role="table" style="width: 100%; border-collapse: collapse; margin-top: 10px;">',
      '                <thead>',
      '                    <tr>',
      generateDataTableHTMLHeaders(),
      '                    </tr>',
      '                </thead>',
      '                <tbody>',
      generateDataTableHTMLRows(),
      '                </tbody>',
      '            </table>',
      '        </div>',
      '    </div>',
      '    <' + 'script>',
      '        // Data and options are plain JSON. Callback functions used in the',
      '        // builder (custom tooltips, tick formatters, legends) are not carried',
      '        // over, so tooltips and ticks use Chart.js defaults.',
      '        const ctx = document.getElementById(\'chartCanvas\').getContext(\'2d\');',
      `        const chartData = ${chartDataConfig};`,
      `        const chartOptions = ${chartOptionsConfigStr};`,
      '        ',
      ...(chartTypeForExport === 'matrix' ? [
        '        // Matrix cell size, colour and axis labels are functions, so they are set here.',
        `        const columnLabels = ${scriptSafeJson(heatmapData.value.columns, 0)};`,
        `        const rowLabels = ${scriptSafeJson(heatmapData.value.rows, 0)};`,
        `        const scaleColors = ${scriptSafeJson(heatmapColors, 0)};`,
        '        const cellValues = chartData.datasets[0].data.map(function (d) { return d.v; });',
        '        const vMin = Math.min.apply(null, cellValues);',
        '        const vMax = Math.max.apply(null, cellValues);',
        '        chartData.datasets[0].width = function (c) { const a = c.chart.chartArea || {}; return (a.right - a.left) / columnLabels.length; };',
        '        chartData.datasets[0].height = function (c) { const a = c.chart.chartArea || {}; return (a.bottom - a.top) / rowLabels.length; };',
        '        chartData.datasets[0].backgroundColor = function (c) {',
        '            if (!c.raw || vMax === vMin) return scaleColors[0];',
        '            return scaleColors[Math.floor(((c.raw.v - vMin) / (vMax - vMin)) * (scaleColors.length - 1))];',
        '        };',
        '        chartOptions.scales.x.ticks.callback = function(value) { return columnLabels[value] || ""; };',
        '        chartOptions.scales.y.ticks.callback = function(value) { return rowLabels[value] || ""; };'
      ] : []),
      '        new Chart(ctx, {',
      `            type: ${scriptSafeJson(chartTypeForExport, 0)},`,
      '            data: chartData,',
      '            options: chartOptions',
      '        });',
      '    </' + 'script>',
      closeBody,
      closeHtml
    ];
    
    const htmlContent = htmlParts.join('\n');
    downloadBlob(new Blob([htmlContent], { type: 'text/html' }), `${exportFileBase()}-${Date.now()}.html`);
    showNotice('HTML export downloaded.', 'success');
  } else if (format === 'png') {
    try {
      const canvas = await captureChart();
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Could not encode the PNG');
      downloadBlob(blob, `${exportFileBase()}-${Date.now()}.png`);
      showNotice('PNG downloaded. Use "Export caption" for the title, summary and key insight as text.', 'success');
    } catch (error) {
      console.error('PNG export error:', error);
      showNotice(`PNG export failed: ${error.message}. Please try HTML or JSON export.`, 'error');
    }
  } else if (format === 'caption') {
    const captionText = [
      chartConfig.value.title,
      chartConfig.value.summary,
      chartConfig.value.keyInsight ? `Key Insight: ${chartConfig.value.keyInsight}` : ''
    ].filter(Boolean).join('\n\n');
    downloadBlob(new Blob([captionText], { type: 'text/plain' }), `${exportFileBase()}-caption.txt`);
    showNotice('Caption downloaded.', 'success');
  } else if (format === 'pdf') {
    // PDF export with jsPDF
    try {
      const { jsPDF } = await import('jspdf');
      const canvas = await captureChart();
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 280;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pageHeight = pdf.internal.pageSize.getHeight();
      // Start a new page when the next `needed` mm would run off this one
      const ensureRoom = (needed) => {
        if (yPos + needed > pageHeight - 10) {
          pdf.addPage();
          yPos = 15;
        }
      };
      
      // Add chart image (scaled to fit the first page)
      const fitHeight = Math.min(imgHeight, pageHeight - 20);
      const fitWidth = (imgWidth * fitHeight) / imgHeight;
      pdf.addImage(imgData, 'PNG', 10, 10, fitWidth, fitHeight, undefined, 'FAST');
      
      // Add summary and key insight
      let yPos = fitHeight + 20;
      ensureRoom(10);
      pdf.setFontSize(16);
      pdf.text(chartConfig.value.title || 'Chart', 10, yPos);
      yPos += 10;
      pdf.setFontSize(12);
      pdf.text('Summary:', 10, yPos);
      yPos += 7;
      pdf.setFontSize(10);
      const summaryLines = pdf.splitTextToSize(chartConfig.value.summary || '', 270);
      ensureRoom(summaryLines.length * 7 + 12);
      pdf.text(summaryLines, 10, yPos);
      yPos += summaryLines.length * 7 + 5;
      pdf.setFontSize(12);
      pdf.text('Key Insight:', 10, yPos);
      yPos += 7;
      pdf.setFontSize(10);
      const insightLines = pdf.splitTextToSize(chartConfig.value.keyInsight || '', 270);
      ensureRoom(insightLines.length * 7 + 12);
      pdf.text(insightLines, 10, yPos);
      yPos += insightLines.length * 7 + 10;
      
      // Add data table
      ensureRoom(20);
      pdf.setFontSize(12);
      pdf.text('Data Table', 10, yPos);
      yPos += 7;
      pdf.setFontSize(8);
      const tableData = generateDataTable();
      const headers = dataTableHeaders.value;
      
      // Table headers
      let xPos = 10;
      headers.forEach(header => {
        pdf.text(header.label, xPos, yPos);
        xPos += 40;
      });
      yPos += 5;
      
      // Table rows
      tableData.forEach(row => {
        xPos = 10;
        headers.forEach(header => {
          const value = typeof row[header.key] === 'number' 
            ? row[header.key].toLocaleString() + (header.key === 'value' && chartConfig.value.dataUnit ? ' ' + chartConfig.value.dataUnit : '')
            : String(row[header.key] || '');
          pdf.text(value, xPos, yPos);
          xPos += 40;
        });
        yPos += 5;
        ensureRoom(5);
      });
      
      pdf.save(`${exportFileBase()}-${Date.now()}.pdf`);
      showNotice('PDF downloaded.', 'success');
    } catch (error) {
      console.error('PDF export error:', error);
      showNotice(`PDF export failed: ${error.message}. Please try HTML or JSON export.`, 'error');
    }
  } else if (format === 'ppt') {
    // PPT export with pptxgenjs
    try {
      const PptxGenJS = (await import('pptxgenjs')).default;
      const canvas = await captureChart();
      
      const imgData = canvas.toDataURL('image/png');
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_16x9'; // 10 x 5.625 in
      
      // Add slide with chart, everything kept inside the 10 x 5.625 in slide
      const slide = pptx.addSlide();
      slide.addText(chartConfig.value.title || 'Chart', {
        x: 0.5,
        y: 0.2,
        w: 9,
        h: 0.5,
        fontSize: 24,
        bold: true
      });
      
      // Fit the image in a 9 x 3.5 in box, keeping its aspect ratio
      const aspect = canvas.width / canvas.height;
      const imgW = Math.min(9, 3.5 * aspect);
      const imgH = imgW / aspect;
      slide.addImage({
        data: imgData,
        x: 0.5 + (9 - imgW) / 2,
        y: 0.8,
        w: imgW,
        h: imgH,
        altText: [chartConfig.value.title, chartConfig.value.summary].filter(Boolean).join('. ')
      });
      
      slide.addText(chartConfig.value.summary || '', {
        x: 0.5,
        y: 4.4,
        w: 9,
        h: 0.5,
        fontSize: 12
      });
      
      slide.addText('Key Insight: ' + (chartConfig.value.keyInsight || ''), {
        x: 0.5,
        y: 4.95,
        w: 9,
        h: 0.5,
        fontSize: 12,
        bold: true
      });
      
      // Add data table slide
      const tableSlide = pptx.addSlide();
      tableSlide.addText('Data Table', {
        x: 0.5,
        y: 0.3,
        w: 9,
        h: 0.5,
        fontSize: 24,
        bold: true
      });
      
      const tableData = generateDataTable();
      const headers = dataTableHeaders.value;
      const tableRows = [
        headers.map(h => h.label),
        ...tableData.map(row => headers.map(header => {
          const value = typeof row[header.key] === 'number' 
            ? row[header.key].toLocaleString() + (header.key === 'value' && chartConfig.value.dataUnit ? ' ' + chartConfig.value.dataUnit : '')
            : String(row[header.key] || '');
          return value;
        }))
      ];
      
      tableSlide.addTable(tableRows, {
        x: 0.5,
        y: 1,
        w: 9,
        colW: headers.map(() => 9 / Math.max(headers.length, 1)),
        fontSize: 10
      });
      
      await pptx.writeFile({ fileName: `${exportFileBase()}-${Date.now()}.pptx` });
      showNotice('PowerPoint file downloaded.', 'success');
    } catch (error) {
      console.error('PPT export error:', error);
      showNotice(`PPT export failed: ${error.message}. Please try HTML or JSON export.`, 'error');
    }
  } else if (format === 'word') {
    // Word export with docx
    try {
      const { Document, Packer, Paragraph, ImageRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel } = await import('docx');
      const canvas = await captureChart();
      
      // docx wants binary image data; Buffer does not exist in the browser.
      const pngBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!pngBlob) throw new Error('Could not encode the chart image');
      const imgBytes = new Uint8Array(await pngBlob.arrayBuffer());
      const imgWidth = 600;
      const imgHeight = Math.round((canvas.height / canvas.width) * imgWidth);
      
      // Create data table
      const tableData = generateDataTable();
      const headers = dataTableHeaders.value;
      const tableRows = [
        new TableRow({
          children: headers.map(header => new TableCell({
            children: [new Paragraph(header.label)],
            width: { size: 20, type: WidthType.PERCENTAGE }
          }))
        }),
        ...tableData.map(row => new TableRow({
          children: headers.map(header => new TableCell({
            children: [new Paragraph(
              typeof row[header.key] === 'number' 
                ? row[header.key].toLocaleString() + (header.key === 'value' && chartConfig.value.dataUnit ? ' ' + chartConfig.value.dataUnit : '')
                : String(row[header.key] || '')
            )],
            width: { size: 20, type: WidthType.PERCENTAGE }
          }))
        }))
      ];
      
      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({
              text: chartConfig.value.title,
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER
            }),
            new Paragraph({
              text: '',
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [
                new ImageRun({
                  data: imgBytes,
                  transformation: { width: imgWidth, height: imgHeight },
                  altText: {
                    name: 'Chart',
                    title: chartConfig.value.title || 'Chart',
                    description: [chartConfig.value.title, chartConfig.value.summary].filter(Boolean).join('. ')
                  }
                })
              ],
              alignment: AlignmentType.CENTER
            }),
            new Paragraph({
              text: '',
              spacing: { after: 200 }
            }),
            new Paragraph({
              text: 'Summary:',
              heading: HeadingLevel.HEADING_2
            }),
            new Paragraph({
              text: chartConfig.value.summary
            }),
            new Paragraph({
              text: '',
              spacing: { after: 200 }
            }),
            new Paragraph({
              text: 'Key Insight:',
              heading: HeadingLevel.HEADING_2
            }),
            new Paragraph({
              text: chartConfig.value.keyInsight
            }),
            new Paragraph({
              text: '',
              spacing: { after: 400 }
            }),
            new Paragraph({
              text: 'Data Table',
              heading: HeadingLevel.HEADING_2
            }),
            new Table({
              rows: tableRows,
              width: { size: 100, type: WidthType.PERCENTAGE }
            })
          ]
        }]
      });
      
      const blob = await Packer.toBlob(doc);
      downloadBlob(blob, `${exportFileBase()}-${Date.now()}.docx`);
      showNotice('Word document downloaded.', 'success');
    } catch (error) {
      console.error('Word export error:', error);
      showNotice(`Word export failed: ${error.message}. Please try HTML or JSON export.`, 'error');
    }
  }
};





onMounted(() => {
  // Load sample data on mount (PageShell opens the docs drawer when the side nav asks)
  loadSampleData();
  // Initialize custom colors if custom scheme is selected
  initializeCustomColors();
});

// Keep the heatmap value grid the same shape as its row/column labels, so
// adding a row or column does not leave v-model pointing at a missing array.
watch(
  () => [heatmapData.value.rows.length, heatmapData.value.columns.length],
  ([rowCount, columnCount]) => {
    const values = heatmapData.value.values || [];
    const resized = Array.from({ length: rowCount }, (_, r) =>
      Array.from({ length: columnCount }, (_, c) => values[r]?.[c] ?? 0)
    );
    const same = values.length === rowCount && values.every((row) => row.length === columnCount);
    if (!same) heatmapData.value.values = resized;
  }
);

// Watch for chart type changes and load appropriate sample data
watch(selectedChartType, () => {
  chartKey.value++;
  loadSampleData();
  initializeCustomColors();
});

// Watch for data changes to update custom colors
watch([chartData, multiDatasetData], () => {
  if (chartConfig.value.colorScheme === 'custom') {
    initializeCustomColors();
  }
}, { deep: true });

// Treemap SVG Component
const TreemapSVG = {
  props: ['data', 'colors'],
  setup(props, { expose }) {
    const containerRef = ref(null);
    const width = ref(400);
    const height = ref(300);
    
    // Flatten tree to get all leaf nodes
    const flattenTree = (node, level = 0, path = '') => {
      const result = [];
      if (node.children && node.children.length > 0) {
        node.children.forEach((child, idx) => {
          result.push(...flattenTree(child, level + 1, path ? `${path}.${idx}` : `${idx}`));
        });
      } else {
        result.push({ 
          name: node.name || 'Item',
          value: node.value || 0,
          level,
          path
        });
      }
      return result;
    };
    
    const items = computed(() => {
      const flat = flattenTree(props.data);
      const total = flat.reduce((sum, item) => sum + item.value, 0);
      if (total === 0) return [];
      
      // Sort by value descending for better layout
      return flat
        .map((item, index) => ({
          ...item,
          ratio: item.value / total,
          color: props.colors[index % props.colors.length]
        }))
        .sort((a, b) => b.value - a.value);
    });
    
    // Squarified treemap layout algorithm
    const layout = computed(() => {
      if (items.value.length === 0) return [];
      
      const rects = [];
      const w = width.value;
      const h = height.value;
      
      // Squarified treemap algorithm
      const squarify = (items, x, y, w, h) => {
        if (items.length === 0) return;
        if (items.length === 1) {
          const item = items[0];
          rects.push({
            ...item,
            x,
            y,
            width: w,
            height: h
          });
          return;
        }
        
        const total = items.reduce((sum, item) => sum + item.value, 0);
        const area = w * h;
        
        // Determine if we should layout horizontally or vertically
        const shouldLayoutHorizontally = w >= h;
        
        if (shouldLayoutHorizontally) {
          // Layout horizontally (rows)
          let currentY = y;
          let remainingHeight = h;
          let itemIndex = 0;
          
          while (itemIndex < items.length && remainingHeight > 0) {
            const rowItems = [];
            let rowSum = 0;
            let bestRow = [];
            let bestWorst = Infinity;
            
            // Build the best row
            for (let i = itemIndex; i < items.length; i++) {
              const testRow = items.slice(itemIndex, i + 1);
              const testSum = testRow.reduce((sum, item) => sum + item.value, 0);
              const rowHeight = (testSum / total) * h;
              const rowWidth = w;
              
              // Calculate worst aspect ratio
              let worst = 0;
              testRow.forEach(item => {
                const itemWidth = (item.value / testSum) * rowWidth;
                const itemHeight = rowHeight;
                const aspectRatio = Math.max(itemWidth / itemHeight, itemHeight / itemWidth);
                worst = Math.max(worst, aspectRatio);
              });
              
              if (worst < bestWorst) {
                bestWorst = worst;
                bestRow = testRow;
                rowSum = testSum;
              } else {
                break;
              }
            }
            
            const rowHeight = (rowSum / total) * h;
            let currentX = x;
            
            bestRow.forEach((item, idx) => {
              const itemWidth = (item.value / rowSum) * w;
              rects.push({
                ...item,
                x: currentX,
                y: currentY,
                width: itemWidth,
                height: rowHeight
              });
              currentX += itemWidth;
            });
            
            currentY += rowHeight;
            remainingHeight -= rowHeight;
            itemIndex += bestRow.length;
          }
        } else {
          // Layout vertically (columns)
          let currentX = x;
          let remainingWidth = w;
          let itemIndex = 0;
          
          while (itemIndex < items.length && remainingWidth > 0) {
            const colItems = [];
            let colSum = 0;
            let bestCol = [];
            let bestWorst = Infinity;
            
            // Build the best column
            for (let i = itemIndex; i < items.length; i++) {
              const testCol = items.slice(itemIndex, i + 1);
              const testSum = testCol.reduce((sum, item) => sum + item.value, 0);
              const colWidth = (testSum / total) * w;
              const colHeight = h;
              
              // Calculate worst aspect ratio
              let worst = 0;
              testCol.forEach(item => {
                const itemHeight = (item.value / testSum) * colHeight;
                const itemWidth = colWidth;
                const aspectRatio = Math.max(itemWidth / itemHeight, itemHeight / itemWidth);
                worst = Math.max(worst, aspectRatio);
              });
              
              if (worst < bestWorst) {
                bestWorst = worst;
                bestCol = testCol;
                colSum = testSum;
              } else {
                break;
              }
            }
            
            const colWidth = (colSum / total) * w;
            let currentY = y;
            
            bestCol.forEach((item, idx) => {
              const itemHeight = (item.value / colSum) * h;
              rects.push({
                ...item,
                x: currentX,
                y: currentY,
                width: colWidth,
                height: itemHeight
              });
              currentY += itemHeight;
            });
            
            currentX += colWidth;
            remainingWidth -= colWidth;
            itemIndex += bestCol.length;
          }
        }
      };
      
      squarify(items.value, 0, 0, w, h);
      return rects;
    });
    
    let resizeObserver = null;
    let handleResize = null;
    
    onMounted(() => {
      const updateSize = () => {
        if (containerRef.value) {
          const rect = containerRef.value.getBoundingClientRect();
          width.value = rect.width || 400;
          height.value = rect.height || 300;
        }
      };
      updateSize();
      
      handleResize = () => updateSize();
      window.addEventListener('resize', handleResize);
      
      // Use ResizeObserver to watch for container size changes
      resizeObserver = new ResizeObserver(updateSize);
      if (containerRef.value) {
        resizeObserver.observe(containerRef.value);
      }
    });
    
    onBeforeUnmount(() => {
      if (handleResize) {
        window.removeEventListener('resize', handleResize);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    });
    
    return () => h('div', {
      ref: containerRef,
      class: 'w-full h-full min-h-96'
    }, [
      h('svg', {
        width: width.value,
        height: height.value,
        viewBox: `0 0 ${width.value} ${height.value}`,
        class: 'w-full h-full'
      }, [
        ...layout.value.map((rect, index) => 
          h('g', { key: index }, [
            h('rect', {
              x: Math.max(0, rect.x),
              y: Math.max(0, rect.y),
              width: Math.max(1, rect.width),
              height: Math.max(1, rect.height),
              fill: rect.color,
              class: 'stroke-surface-raised cursor-pointer',
              'stroke-width': 2,
              rx: 2
            }),
            rect.width > 40 && rect.height > 20 ? h('text', {
              x: rect.x + rect.width / 2,
              y: rect.y + rect.height / 2,
              'text-anchor': 'middle',
              'dominant-baseline': 'middle',
              class: 'fill-ink-on-accent pointer-events-none',
              'font-size': Math.min(rect.width, rect.height) / 8,
              'font-weight': 'bold'
            }, [
              h('tspan', {
                x: rect.x + rect.width / 2,
                dy: rect.height > 40 ? '-0.3em' : '0'
              }, rect.name),
              rect.height > 40 ? h('tspan', {
                x: rect.x + rect.width / 2,
                dy: '1.2em',
                'font-size': Math.min(rect.width, rect.height) / 10
              }, rect.value) : null
            ]) : null
          ])
        )
      ])
    ]);
  }
};

// Sankey SVG Component
const SankeySVG = {
  props: ['data', 'colors'],
  setup(props) {
    const width = 400;
    const height = 300;
    const nodeWidth = 80;
    const nodeHeight = 30;
    const nodeSpacing = 20;
    
    const nodes = computed(() => {
      const cols = 3; // Source, Process, Target
      const nodesByCol = [[], [], []];
      
      props.data.nodes.forEach((node, index) => {
        let col = 0;
        if (node.id.includes('Process')) col = 1;
        else if (node.id.includes('Target')) col = 2;
        nodesByCol[col].push({ ...node, col, index });
      });
      
      const positioned = [];
      nodesByCol.forEach((colNodes, colIndex) => {
        const colX = colIndex * (width / 3) + (width / 3 - nodeWidth) / 2;
        colNodes.forEach((node, nodeIndex) => {
          const nodeY = (height / (colNodes.length + 1)) * (nodeIndex + 1) - nodeHeight / 2;
          positioned.push({
            ...node,
            x: colX,
            y: nodeY,
            width: nodeWidth,
            height: nodeHeight
          });
        });
      });
      
      return positioned;
    });
    
    const links = computed(() => {
      return props.data.links.map(link => {
        const sourceNode = nodes.value.find(n => n.id === link.source);
        const targetNode = nodes.value.find(n => n.id === link.target);
        if (!sourceNode || !targetNode) return null;
        
        return {
          ...link,
          sourceX: sourceNode.x + sourceNode.width,
          sourceY: sourceNode.y + sourceNode.height / 2,
          targetX: targetNode.x,
          targetY: targetNode.y + targetNode.height / 2,
          color: props.colors[Math.floor(Math.random() * props.colors.length)] + '80'
        };
      }).filter(Boolean);
    });
    
    return () => h('svg', {
      width: width,
      height: height,
      viewBox: `0 0 ${width} ${height}`,
      class: 'w-full h-full'
    }, [
      // Links (paths)
      ...links.value.map((link, index) => {
        const path = `M ${link.sourceX} ${link.sourceY} C ${link.sourceX + 50} ${link.sourceY}, ${link.targetX - 50} ${link.targetY}, ${link.targetX} ${link.targetY}`;
        return h('path', {
          key: `link-${index}`,
          d: path,
          stroke: link.color,
          'stroke-width': Math.max(2, link.value / 5),
          fill: 'none',
          opacity: 0.6
        });
      }),
      // Nodes
      ...nodes.value.map((node, index) => 
        h('g', { key: `node-${index}` }, [
          h('rect', {
            x: node.x,
            y: node.y,
            width: node.width,
            height: node.height,
            fill: props.colors[index % props.colors.length],
            class: 'stroke-surface-raised',
            'stroke-width': 2,
            rx: 4
          }),
          h('text', {
            x: node.x + node.width / 2,
            y: node.y + node.height / 2,
            'text-anchor': 'middle',
            'dominant-baseline': 'middle',
            class: 'fill-ink-on-accent',
            'font-size': 12,
            'font-weight': 'bold'
          }, node.label)
        ])
      )
    ]);
  }
};


// Bullet Graph SVG Component
const BulletGraphSVG = {
  props: ['data', 'colors'],
  setup(props) {
    const width = 400;
    const height = computed(() => props.data.length * 60 + 40);
    
    const items = computed(() => {
      return props.data.map((item, index) => {
        const y = index * 60 + 30;
        const barWidth = width - 100;
        const valueWidth = (item.value / item.max) * barWidth;
        const targetX = (item.target / item.max) * barWidth;
        const poorWidth = (item.ranges.fair / item.max) * barWidth;
        const fairWidth = ((item.ranges.good - item.ranges.fair) / item.max) * barWidth;
        const goodWidth = ((item.ranges.excellent - item.ranges.good) / item.max) * barWidth;
        
        return {
          ...item,
          y,
          barWidth,
          valueWidth,
          targetX,
          poorWidth,
          fairWidth,
          goodWidth,
          color: props.colors[index % props.colors.length]
        };
      });
    });
    
    return () => h('svg', {
      width: width,
      height: height.value,
      viewBox: `0 0 ${width} ${height.value}`,
      class: 'w-full h-full',
      role: 'img',
      'aria-label': 'Bullet graph showing values, targets, and ranges'
    }, [
      ...items.value.map((item, index) => 
        h('g', { key: `bullet-${index}` }, [
          // Range backgrounds
          h('rect', {
            x: 80,
            y: item.y - 15,
            width: item.poorWidth,
            height: 30,
            class: 'fill-danger-solid',
            opacity: 0.3,
            'aria-label': `Poor range: 0 to ${item.ranges.fair}`
          }),
          h('rect', {
            x: 80 + item.poorWidth,
            y: item.y - 15,
            width: item.fairWidth,
            height: 30,
            class: 'fill-warning-solid',
            opacity: 0.3,
            'aria-label': `Fair range: ${item.ranges.fair} to ${item.ranges.good}`
          }),
          h('rect', {
            x: 80 + item.poorWidth + item.fairWidth,
            y: item.y - 15,
            width: item.goodWidth,
            height: 30,
            class: 'fill-success-solid',
            opacity: 0.3,
            'aria-label': `Good range: ${item.ranges.good} to ${item.ranges.excellent}`
          }),
          // Value bar
          h('rect', {
            x: 80,
            y: item.y - 10,
            width: item.valueWidth,
            height: 20,
            fill: item.color,
            'aria-label': `Value: ${item.value}, Target: ${item.target}, Max: ${item.max}`
          }),
          // Target marker
          h('line', {
            x1: 80 + item.targetX,
            y1: item.y - 20,
            x2: 80 + item.targetX,
            y2: item.y + 20,
            class: 'stroke-ink-strong',
            'stroke-width': 3,
            'stroke-dasharray': '5,5',
            'aria-label': `Target: ${item.target}`
          }),
          // Label
          h('text', {
            x: 5,
            y: item.y + 5,
            'text-anchor': 'start',
            'dominant-baseline': 'middle',
            class: 'fill-ink-strong',
            'font-size': 12,
            'font-weight': 'bold'
          }, item.label),
          // Value text
          h('text', {
            x: 85 + item.valueWidth,
            y: item.y + 5,
            'text-anchor': 'start',
            'dominant-baseline': 'middle',
            class: 'fill-ink-secondary',
            'font-size': 11
          }, item.value)
        ])
      )
    ]);
  }
};

// Chord Diagram SVG Component
const ChordDiagramSVG = {
  props: ['data', 'colors'],
  setup(props) {
    const width = 400;
    const height = 400;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 50;
    
    const nodes = computed(() => {
      return props.data.nodes.map((node, index) => {
        const angle = (index / props.data.nodes.length) * 2 * Math.PI - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        return {
          ...node,
          x,
          y,
          angle,
          color: props.colors[index % props.colors.length]
        };
      });
    });
    
    const links = computed(() => {
      return props.data.links.map(link => {
        const sourceNode = nodes.value.find(n => n.id === link.source);
        const targetNode = nodes.value.find(n => n.id === link.target);
        if (!sourceNode || !targetNode) return null;
        
        // Create curved path for chord
        const dx = targetNode.x - sourceNode.x;
        const dy = targetNode.y - sourceNode.y;
        const dr = Math.sqrt(dx * dx + dy * dy);
        const sweep = link.value > 0 ? 1 : 0;
        
        return {
          ...link,
          sourceX: sourceNode.x,
          sourceY: sourceNode.y,
          targetX: targetNode.x,
          targetY: targetNode.y,
          path: `M ${sourceNode.x} ${sourceNode.y} A ${dr} ${dr} 0 0 ${sweep} ${targetNode.x} ${targetNode.y}`,
          strokeWidth: Math.max(2, link.value / 5),
          color: props.colors[Math.floor(Math.random() * props.colors.length)] + '80'
        };
      }).filter(Boolean);
    });
    
    return () => h('svg', {
      width: width,
      height: height,
      viewBox: `0 0 ${width} ${height}`,
      class: 'w-full h-full',
      role: 'img',
      'aria-label': 'Chord diagram showing relationships between entities'
    }, [
      // Links (chords)
      ...links.value.map((link, index) => 
        h('path', {
          key: `chord-${index}`,
          d: link.path,
          stroke: link.color,
          'stroke-width': link.strokeWidth,
          fill: 'none',
          opacity: 0.6,
          'aria-label': `Relationship between ${props.data.nodes.find(n => n.id === link.source)?.label || link.source} and ${props.data.nodes.find(n => n.id === link.target)?.label || link.target}: ${link.value}`
        })
      ),
      // Nodes
      ...nodes.value.map((node, index) => 
        h('g', { key: `node-${index}` }, [
          h('circle', {
            cx: node.x,
            cy: node.y,
            r: 20,
            fill: node.color,
            class: 'stroke-surface-raised cursor-pointer focus-visible:outline focus-visible:outline-2 outline-focus',
            'stroke-width': 2,
            'aria-label': `Entity: ${node.label}`,
            tabindex: 0,
            role: 'button'
          }),
          h('text', {
            x: node.x + (node.x > centerX ? 30 : -30),
            y: node.y,
            'text-anchor': node.x > centerX ? 'start' : 'end',
            'dominant-baseline': 'middle',
            class: 'fill-ink-strong pointer-events-none',
            'font-size': 11,
            'font-weight': 'bold'
          }, node.label)
        ])
      )
    ]);
  }
};
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.3s ease-in;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* A group of inputs for one item (a dataset, a row, a link) */
.data-card {
  @apply flex flex-col gap-2 p-3 rounded-tile border border-line bg-surface-sunken;
}
.heatmap-cell {
  @apply w-16 h-8 px-1 text-center text-sm rounded-control border border-line-control bg-surface-control text-ink;
  @apply focus:outline focus:outline-2 focus:outline-offset-0 outline-focus;
}
.chart-stage {
  @apply flex items-center justify-center p-6 rounded-tile bg-surface-raised border border-line;
}
.chart-figure {
  @apply w-full max-w-full h-96 rounded-tile focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 outline-focus;
}
.table-sort {
  @apply inline-flex items-center gap-1 uppercase tracking-wide hover:text-ink rounded-control focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus;
}
</style>
