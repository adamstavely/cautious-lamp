<template>
  <div class="export-panel" :class="{ 'panel-open': showPanel }">
    <button class="export-toggle" @click="showPanel = !showPanel">
      <span class="export-icon">⚙️</span>
      <span class="export-text">Export Tokens</span>
    </button>
    
    <div class="panel-content" v-if="showPanel">
      <div class="panel-header">
        <h3>Style Dictionary Export</h3>
        <button class="close-panel" @click="showPanel = false">×</button>
      </div>
      
      <div class="font-tokens">
        <div class="token-group">
          <label class="token-label">
            <span class="label-text">Heading Font</span>
            <input 
              type="text" 
              v-model="fontTokens.heading" 
              placeholder="e.g. Playfair Display"
              class="token-input"
            />
          </label>
          
          <label class="token-label">
            <span class="label-text">Body Font</span>
            <input 
              type="text" 
              v-model="fontTokens.body" 
              placeholder="e.g. Roboto"
              class="token-input"
            />
          </label>
          
          <label class="token-label">
            <span class="label-text">UI Font</span>
            <input 
              type="text" 
              v-model="fontTokens.ui" 
              placeholder="e.g. Roboto Mono"
              class="token-input"
            />
          </label>
        </div>
        
        <div class="export-actions">
          <button @click="exportStyleDictionary" class="export-btn">
            <span class="btn-icon">📁</span>
            Export JSON
          </button>
          <button @click="copyToClipboard" class="copy-btn" v-if="styleJSON">
            <span class="btn-icon">📋</span>
            Copy JSON
          </button>
        </div>
        
        <div class="json-preview" v-if="styleJSON">
          <div class="preview-header">
            <span class="preview-title">Generated JSON</span>
            <span class="preview-size">{{ Math.round(styleJSON.length / 1024 * 100) / 100 }}KB</span>
          </div>
          <pre class="json-code">{{ styleJSON }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps(['fontTokens', 'styleJSON', 'exportStyleDictionary'])

const showPanel = ref(false)

function copyToClipboard() {
  if (navigator.clipboard && window.getSelection) {
    const styleJSON = document.querySelector('.json-code')?.textContent
    if (styleJSON) {
      navigator.clipboard.writeText(styleJSON).then(() => {
        // Could add a toast notification here
        console.log('JSON copied to clipboard')
      })
    }
  }
}
</script>