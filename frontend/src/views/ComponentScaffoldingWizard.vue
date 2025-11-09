<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-auto"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <div class="h-full p-8">
        <!-- Hero Section -->
        <div class="max-w-7xl mx-auto mb-8">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
            <!-- Background texture/grain effect -->
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Component Scaffolding Wizard
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Create new Stencil.js web components with our interactive wizard. Generate production-ready components with tests, documentation, and framework integrations.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                    <defs>
                      <linearGradient id="wizardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Wizard/magic wand icon -->
                    <path d="M 50 100 L 150 100" stroke="url(#wizardGradient)" stroke-width="4" stroke-linecap="round"/>
                    <circle cx="50" cy="100" r="8" fill="url(#wizardGradient)"/>
                    <path d="M 150 100 L 170 80 L 160 90 L 170 100 L 160 110 L 170 120" stroke="url(#wizardGradient)" stroke-width="3" fill="none" stroke-linecap="round"/>
                    <circle cx="60" cy="80" r="4" fill="url(#wizardGradient)" opacity="0.6"/>
                    <circle cx="80" cy="70" r="4" fill="url(#wizardGradient)" opacity="0.8"/>
                    <circle cx="100" cy="60" r="4" fill="url(#wizardGradient)"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Wizard Steps -->
        <div class="max-w-5xl mx-auto">
          <!-- Step Indicator -->
          <div class="mb-8">
            <div class="flex items-center justify-between">
              <div 
                v-for="(step, index) in steps" 
                :key="index"
                class="flex items-center flex-1"
              >
                <div class="flex items-center">
                  <div 
                    class="w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors"
                    :class="currentStep > index 
                      ? 'bg-indigo-600 text-white' 
                      : currentStep === index 
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-200 dark:ring-indigo-900' 
                        : (isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600')"
                  >
                    <span v-if="currentStep > index" class="material-symbols-outlined text-lg">check</span>
                    <span v-else>{{ index + 1 }}</span>
                  </div>
                  <div class="ml-3 hidden sm:block">
                    <div 
                      class="text-sm font-medium"
                      :class="currentStep >= index 
                        ? (isDarkMode ? 'text-white' : 'text-gray-900') 
                        : (isDarkMode ? 'text-gray-400' : 'text-gray-500')"
                    >
                      {{ step.title }}
                    </div>
                  </div>
                </div>
                <div 
                  v-if="index < steps.length - 1"
                  class="flex-1 h-1 mx-2"
                  :class="currentStep > index ? 'bg-indigo-600' : (isDarkMode ? 'bg-gray-700' : 'bg-gray-200')"
                ></div>
              </div>
            </div>
          </div>

          <!-- Wizard Content -->
          <div 
            class="rounded-2xl p-8 border"
            :class="isDarkMode 
              ? 'border-gray-700 bg-slate-900' 
              : 'border-gray-300 bg-white'"
          >
            <!-- Getting Started Guide -->
            <div 
              class="mb-6 p-6 rounded-lg border-l-4"
              :class="isDarkMode 
                ? 'bg-indigo-900/20 border-indigo-500' 
                : 'bg-indigo-50 border-indigo-500'"
            >
              <div class="flex items-start gap-3 mb-4">
                <span class="material-symbols-outlined text-indigo-500 mt-0.5 text-2xl">auto_awesome</span>
                <div class="flex-1">
                  <h3 class="font-semibold mb-2 text-lg" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    How to Use This Wizard
                  </h3>
                  <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    This wizard generates production-ready Stencil.js web components. Follow these 4 simple steps to create your component:
                  </p>
                  
                  <div class="space-y-3 mb-4">
                    <div class="flex items-start gap-3">
                      <div class="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">1</div>
                      <div>
                        <p class="text-sm font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Basic Information</p>
                        <p class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Enter your component name (e.g., "MyButton"), description, and category. Optionally start from a template.</p>
                      </div>
                    </div>
                    <div class="flex items-start gap-3">
                      <div class="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">2</div>
                      <div>
                        <p class="text-sm font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Add Properties</p>
                        <p class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Define the inputs your component accepts (e.g., "variant", "size", "disabled"). Click "Add Property" for each one.</p>
                      </div>
                    </div>
                    <div class="flex items-start gap-3">
                      <div class="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">3</div>
                      <div>
                        <p class="text-sm font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Events & Methods (Optional)</p>
                        <p class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Add custom events (e.g., "buttonClick") and public methods (e.g., "open", "close") if needed.</p>
                      </div>
                    </div>
                    <div class="flex items-start gap-3">
                      <div class="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">4</div>
                      <div>
                        <p class="text-sm font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Generate & Download</p>
                        <p class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Review the generated code, then click "Create Component" to add it to the design system or download the files.</p>
                      </div>
                    </div>
                  </div>

                  <div 
                    class="p-3 rounded-lg mt-4"
                    :class="isDarkMode 
                      ? 'bg-blue-900/20 border border-blue-800' 
                      : 'bg-blue-50 border border-blue-200'"
                  >
                    <p class="text-xs font-medium mb-2" :class="isDarkMode ? 'text-blue-300' : 'text-blue-700'">
                      <strong>💡 Quick Example:</strong> To create a button component:
                    </p>
                    <ol class="text-xs space-y-1 ml-4 list-decimal" :class="isDarkMode ? 'text-blue-200' : 'text-blue-600'">
                      <li>Name: "MyButton", Category: "Form"</li>
                      <li>Add property: name="variant", type="enum", options="primary,secondary"</li>
                      <li>Add property: name="disabled", type="boolean", default="false"</li>
                      <li>Add event: name="buttonClick" (optional)</li>
                      <li>Click "Generate" and review the code</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 1: Basic Information -->
            <div v-if="currentStep === 0" class="space-y-6">
              <div>
                <h2 class="text-2xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Basic Information
                </h2>
                <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Start by providing basic information about your component. This information will be used to generate the component class name, HTML tag, and documentation.
                </p>
              </div>

              <div>
                <div class="flex items-center gap-2 mb-2">
                  <label class="block text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Component Name *
                  </label>
                  <div class="group relative">
                    <span class="material-symbols-outlined text-sm cursor-help" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">help</span>
                    <div class="absolute left-0 bottom-full mb-2 w-64 p-3 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 text-xs"
                      :class="isDarkMode ? 'bg-slate-800 border border-gray-700 text-gray-300' : 'bg-white border border-gray-200 text-gray-700'"
                    >
                      <strong>PascalCase naming:</strong> Use PascalCase (e.g., "MyButton", "DataTable"). This becomes your TypeScript class name. The tag name will be automatically converted to kebab-case (e.g., "my-button", "data-table").
                    </div>
                  </div>
                </div>
                <input 
                  v-model="componentData.name"
                  type="text"
                  required
                  placeholder="e.g., MyButton, DataTable, Modal"
                  class="w-full px-4 py-2 rounded-lg border transition-colors"
                  :class="isDarkMode 
                    ? 'border-gray-700 bg-slate-800 text-white focus:border-indigo-500' 
                    : 'border-gray-300 bg-white text-gray-900 focus:border-indigo-500'"
                />
                <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                  Use PascalCase. Will be converted to kebab-case for the tag name (e.g., "MyButton" → "my-button").
                </p>
              </div>

              <div>
                <div class="flex items-center gap-2 mb-2">
                  <label class="block text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Description *
                  </label>
                  <div class="group relative">
                    <span class="material-symbols-outlined text-sm cursor-help" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">help</span>
                    <div class="absolute left-0 bottom-full mb-2 w-64 p-3 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 text-xs"
                      :class="isDarkMode ? 'bg-slate-800 border border-gray-700 text-gray-300' : 'bg-white border border-gray-200 text-gray-700'"
                    >
                      Write a clear, concise description of what your component does and when to use it. This will appear in the generated documentation and help other developers understand the component's purpose.
                    </div>
                  </div>
                </div>
                <textarea 
                  v-model="componentData.description"
                  rows="3"
                  required
                  placeholder="Describe what this component does and when to use it. Example: 'A versatile button component for triggering actions throughout your application. Supports multiple variants, sizes, and states.'"
                  class="w-full px-4 py-2 rounded-lg border transition-colors"
                  :class="isDarkMode 
                    ? 'border-gray-700 bg-slate-800 text-white focus:border-indigo-500' 
                    : 'border-gray-300 bg-white text-gray-900 focus:border-indigo-500'"
                ></textarea>
                <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                  This description will be used in the component's JSDoc comments and generated documentation.
                </p>
              </div>

              <div>
                <div class="flex items-center gap-2 mb-2">
                  <label class="block text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Category *
                  </label>
                  <div class="group relative">
                    <span class="material-symbols-outlined text-sm cursor-help" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">help</span>
                    <div class="absolute left-0 bottom-full mb-2 w-64 p-3 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 text-xs"
                      :class="isDarkMode ? 'bg-slate-800 border border-gray-700 text-gray-300' : 'bg-white border border-gray-200 text-gray-700'"
                    >
                      Categories help organize components in the design system. Choose the category that best fits your component's primary purpose.
                    </div>
                  </div>
                </div>
                <Dropdown
                  v-model="componentData.category"
                  :options="categoryOptions"
                  placeholder="Select a category"
                />
                <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                  Categories: Form (inputs, buttons), Display (text, images), Navigation (menus, links), Feedback (alerts, modals), Layout (containers, grids), Data (tables, lists), or Custom.
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Initial Status
                </label>
                <Dropdown
                  v-model="componentData.status"
                  :options="statusOptions"
                  placeholder="Select initial status"
                />
              </div>

              <div>
                <div class="flex items-center gap-2 mb-2">
                  <label class="block text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Start from Template (Optional)
                  </label>
                  <div class="group relative">
                    <span class="material-symbols-outlined text-sm cursor-help" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">help</span>
                    <div class="absolute left-0 bottom-full mb-2 w-64 p-3 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 text-xs"
                      :class="isDarkMode ? 'bg-slate-800 border border-gray-700 text-gray-300' : 'bg-white border border-gray-200 text-gray-700'"
                    >
                      Templates provide pre-configured properties, events, and styles for common component types. You can customize everything after selecting a template.
                    </div>
                  </div>
                </div>
                <Dropdown
                  v-model="selectedTemplateId"
                  :options="templateOptions"
                  placeholder="Select a template to start from"
                  @update:modelValue="loadTemplate"
                />
                <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                  Templates include: Button, Input, Card, Modal. You can modify all fields after selecting a template.
                </p>
              </div>
            </div>

            <!-- Step 2: Properties -->
            <div v-if="currentStep === 1" class="space-y-6">
              <div class="flex items-center justify-between mb-4">
                <div class="flex-1">
                  <h2 class="text-2xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Properties
                  </h2>
                  <p class="text-sm mb-3" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    Properties (props) are the inputs your component accepts. They allow parent components to pass data and configure behavior.
                  </p>
                  <div 
                    class="p-3 rounded-lg mb-4"
                    :class="isDarkMode 
                      ? 'bg-blue-900/20 border border-blue-800' 
                      : 'bg-blue-50 border border-blue-200'"
                  >
                    <p class="text-xs" :class="isDarkMode ? 'text-blue-300' : 'text-blue-700'">
                      <strong>💡 Tip:</strong> In Stencil.js, props are defined with the <code class="px-1 py-0.5 rounded" :class="isDarkMode ? 'bg-slate-700' : 'bg-blue-100'">@Prop()</code> decorator. Props can be reflected to HTML attributes, made mutable, and have default values.
                    </p>
                  </div>
                </div>
                <button 
                  @click="addProperty"
                  class="ml-4 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <span class="material-symbols-outlined text-lg">add</span>
                  Add Property
                </button>
              </div>

              <div class="space-y-4">
                <div 
                  v-for="(prop, index) in componentData.props" 
                  :key="index"
                  class="p-4 rounded-lg border"
                  :class="isDarkMode 
                    ? 'border-gray-700 bg-slate-800' 
                    : 'border-gray-200 bg-gray-50'"
                >
                  <div class="flex items-start justify-between mb-4">
                    <h3 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      Property {{ index + 1 }}
                    </h3>
                    <button 
                      @click="removeProperty(index)"
                      class="text-red-500 hover:text-red-600"
                    >
                      <span class="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>

                  <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label class="block text-xs font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        Name * 
                        <span class="text-xs font-normal" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">(camelCase)</span>
                      </label>
                      <input 
                        v-model="prop.name"
                        type="text"
                        required
                        placeholder="e.g., variant, size, disabled"
                        class="w-full px-3 py-2 rounded-lg border text-sm"
                        :class="isDarkMode 
                          ? 'border-gray-700 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                        Use camelCase (e.g., "variant", "isDisabled")
                      </p>
                    </div>
                    <div>
                      <label class="block text-xs font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Type *</label>
                      <Dropdown
                        v-model="prop.type"
                        :options="propTypeOptions"
                        placeholder="Select type"
                      />
                      <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                        Choose "enum" for predefined options
                      </p>
                    </div>
                  </div>

                  <div v-if="prop.type === 'enum'" class="mb-4">
                    <label class="block text-xs font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      Options (comma-separated) *
                    </label>
                    <input 
                      v-model="prop.optionsString"
                      type="text"
                      placeholder="primary, secondary, tertiary"
                      class="w-full px-3 py-2 rounded-lg border text-sm"
                      :class="isDarkMode 
                        ? 'border-gray-700 bg-slate-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'"
                      @input="updatePropOptions(index, $event.target.value)"
                    />
                    <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                      Separate values with commas. These become TypeScript union types (e.g., <code class="px-1 py-0.5 rounded" :class="isDarkMode ? 'bg-slate-600' : 'bg-gray-200'">'primary' | 'secondary' | 'tertiary'</code>)
                    </p>
                  </div>

                  <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label class="block text-xs font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Default Value</label>
                      <input 
                        v-model="prop.defaultValue"
                        type="text"
                        class="w-full px-3 py-2 rounded-lg border text-sm"
                        :class="isDarkMode 
                          ? 'border-gray-700 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Description</label>
                      <input 
                        v-model="prop.description"
                        type="text"
                        class="w-full px-3 py-2 rounded-lg border text-sm"
                        :class="isDarkMode 
                          ? 'border-gray-700 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                    </div>
                  </div>

                  <div class="space-y-2">
                    <div class="flex items-center gap-4 flex-wrap">
                      <label class="flex items-center gap-2 cursor-pointer group">
                        <input 
                          v-model="prop.required"
                          type="checkbox"
                          class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span class="text-xs flex items-center gap-1" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                          Required
                          <span class="material-symbols-outlined text-xs opacity-0 group-hover:opacity-100 transition-opacity" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">help</span>
                        </span>
                        <div class="absolute left-0 mt-6 w-56 p-2 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 text-xs"
                          :class="isDarkMode ? 'bg-slate-800 border border-gray-700 text-gray-300' : 'bg-white border border-gray-200 text-gray-700'"
                        >
                          Makes the prop required. TypeScript will mark it as non-optional.
                        </div>
                      </label>
                      <label class="flex items-center gap-2 cursor-pointer group relative">
                        <input 
                          v-model="prop.reflect"
                          type="checkbox"
                          class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span class="text-xs flex items-center gap-1" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                          Reflect to Attribute
                          <span class="material-symbols-outlined text-xs opacity-0 group-hover:opacity-100 transition-opacity" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">help</span>
                        </span>
                        <div class="absolute left-0 mt-6 w-64 p-2 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 text-xs"
                          :class="isDarkMode ? 'bg-slate-800 border border-gray-700 text-gray-300' : 'bg-white border border-gray-200 text-gray-700'"
                        >
                          When enabled, prop changes are reflected to the HTML attribute. Useful for CSS selectors and accessibility.
                        </div>
                      </label>
                      <label class="flex items-center gap-2 cursor-pointer group relative">
                        <input 
                          v-model="prop.mutable"
                          type="checkbox"
                          class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span class="text-xs flex items-center gap-1" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                          Mutable
                          <span class="material-symbols-outlined text-xs opacity-0 group-hover:opacity-100 transition-opacity" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">help</span>
                        </span>
                        <div class="absolute left-0 mt-6 w-64 p-2 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 text-xs"
                          :class="isDarkMode ? 'bg-slate-800 border border-gray-700 text-gray-300' : 'bg-white border border-gray-200 text-gray-700'"
                        >
                          Allows the prop to be modified from within the component. By default, props are immutable (read-only).
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div v-if="componentData.props.length === 0" class="text-center py-8">
                  <div class="max-w-md mx-auto">
                    <span class="material-symbols-outlined text-4xl mb-3 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">add_circle_outline</span>
                    <p class="text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      No properties added yet
                    </p>
                    <p class="text-xs mb-4" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                      Properties are the inputs your component accepts. For example, a button might have "variant" and "size" properties.
                    </p>
                    <button 
                      @click="addProperty"
                      class="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-sm font-medium inline-flex items-center gap-2"
                    >
                      <span class="material-symbols-outlined text-lg">add</span>
                      Add Your First Property
                    </button>
                    <div 
                      class="mt-4 p-3 rounded-lg text-left"
                      :class="isDarkMode 
                        ? 'bg-slate-800 border border-gray-700' 
                        : 'bg-gray-50 border border-gray-200'"
                    >
                      <p class="text-xs font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Example: Add a "variant" property
                      </p>
                      <ul class="text-xs space-y-1 ml-4 list-disc" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        <li>Name: <code class="px-1 py-0.5 rounded" :class="isDarkMode ? 'bg-slate-700' : 'bg-gray-200'">variant</code></li>
                        <li>Type: <code class="px-1 py-0.5 rounded" :class="isDarkMode ? 'bg-slate-700' : 'bg-gray-200'">enum</code></li>
                        <li>Options: <code class="px-1 py-0.5 rounded" :class="isDarkMode ? 'bg-slate-700' : 'bg-gray-200'">primary, secondary, tertiary</code></li>
                        <li>Default: <code class="px-1 py-0.5 rounded" :class="isDarkMode ? 'bg-slate-700' : 'bg-gray-200'">primary</code></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 3: Events & Methods -->
            <div v-if="currentStep === 2" class="space-y-6">
              <div class="mb-4">
                <h2 class="text-2xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Events & Methods
                </h2>
                <p class="text-sm mb-3" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Events allow your component to communicate with parent components. Methods provide public APIs that can be called from outside the component.
                </p>
                <div 
                  class="p-3 rounded-lg"
                  :class="isDarkMode 
                    ? 'bg-blue-900/20 border border-blue-800' 
                    : 'bg-blue-50 border border-blue-200'"
                >
                  <p class="text-xs" :class="isDarkMode ? 'text-blue-300' : 'text-blue-700'">
                    <strong>💡 Tip:</strong> Both events and methods are optional. Add them only if your component needs to communicate with parent components or expose public functionality.
                  </p>
                </div>
              </div>

              <!-- Events -->
              <div>
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Events</h3>
                  <button 
                    @click="addEvent"
                    class="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <span class="material-symbols-outlined text-lg">add</span>
                    Add Event
                  </button>
                </div>

                <div class="space-y-4">
                  <div 
                    v-for="(event, index) in componentData.events" 
                    :key="index"
                    class="p-4 rounded-lg border"
                    :class="isDarkMode 
                      ? 'border-gray-700 bg-slate-800' 
                      : 'border-gray-200 bg-gray-50'"
                  >
                    <div class="flex items-start justify-between mb-4">
                      <h4 class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Event {{ index + 1 }}</h4>
                      <button 
                        @click="removeEvent(index)"
                        class="text-red-500 hover:text-red-600"
                      >
                        <span class="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-xs font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                          Name * 
                          <span class="text-xs font-normal" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">(camelCase)</span>
                        </label>
                        <input 
                          v-model="event.name"
                          type="text"
                          required
                          placeholder="e.g., buttonClick, valueChange"
                          class="w-full px-3 py-2 rounded-lg border text-sm"
                          :class="isDarkMode 
                            ? 'border-gray-700 bg-slate-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'"
                        />
                        <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                          Event name in camelCase. Will be emitted as a CustomEvent.
                        </p>
                      </div>
                      <div>
                        <label class="block text-xs font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                          Detail Type
                          <span class="text-xs font-normal" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">(TypeScript)</span>
                        </label>
                        <input 
                          v-model="event.detail"
                          type="text"
                          placeholder="e.g., string, number, { value: string }"
                          class="w-full px-3 py-2 rounded-lg border text-sm"
                          :class="isDarkMode 
                            ? 'border-gray-700 bg-slate-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'"
                        />
                        <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                          TypeScript type for event.detail. Leave empty for no data.
                        </p>
                      </div>
                      <div class="col-span-2">
                        <label class="block text-xs font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Description</label>
                        <input 
                          v-model="event.description"
                          type="text"
                          placeholder="When this event is emitted and what it means"
                          class="w-full px-3 py-2 rounded-lg border text-sm"
                          :class="isDarkMode 
                            ? 'border-gray-700 bg-slate-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'"
                        />
                      </div>
                    </div>
                  </div>
                  <div v-if="componentData.events.length === 0" class="text-center py-6">
                    <div class="max-w-md mx-auto">
                      <span class="material-symbols-outlined text-3xl mb-2 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">radio_button_unchecked</span>
                      <p class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        No events added
                      </p>
                      <p class="text-xs mb-3" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                        Events are optional. Use them to notify parent components when something happens (e.g., button clicked, value changed).
                      </p>
                      <div 
                        class="p-3 rounded-lg text-left"
                        :class="isDarkMode 
                          ? 'bg-slate-800 border border-gray-700' 
                          : 'bg-gray-50 border border-gray-200'"
                      >
                        <p class="text-xs font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                          Example: Add a "buttonClick" event
                        </p>
                        <ul class="text-xs space-y-1 ml-4 list-disc" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                          <li>Name: <code class="px-1 py-0.5 rounded" :class="isDarkMode ? 'bg-slate-700' : 'bg-gray-200'">buttonClick</code></li>
                          <li>Detail Type: <code class="px-1 py-0.5 rounded" :class="isDarkMode ? 'bg-slate-700' : 'bg-gray-200'">void</code> (or leave empty)</li>
                          <li>Description: "Emitted when the button is clicked"</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Methods -->
              <div>
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Methods</h3>
                  <button 
                    @click="addMethod"
                    class="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <span class="material-symbols-outlined text-lg">add</span>
                    Add Method
                  </button>
                </div>

                <div class="space-y-4">
                  <div 
                    v-for="(method, index) in componentData.methods" 
                    :key="index"
                    class="p-4 rounded-lg border"
                    :class="isDarkMode 
                      ? 'border-gray-700 bg-slate-800' 
                      : 'border-gray-200 bg-gray-50'"
                  >
                    <div class="flex items-start justify-between mb-4">
                      <h4 class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Method {{ index + 1 }}</h4>
                      <button 
                        @click="removeMethod(index)"
                        class="text-red-500 hover:text-red-600"
                      >
                        <span class="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-xs font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                          Name * 
                          <span class="text-xs font-normal" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">(camelCase)</span>
                        </label>
                        <input 
                          v-model="method.name"
                          type="text"
                          required
                          placeholder="e.g., open, close, reset"
                          class="w-full px-3 py-2 rounded-lg border text-sm"
                          :class="isDarkMode 
                            ? 'border-gray-700 bg-slate-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'"
                        />
                        <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                          Public method name. Can be called from parent components.
                        </p>
                      </div>
                      <div>
                        <label class="block text-xs font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                          Return Type
                          <span class="text-xs font-normal" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">(TypeScript)</span>
                        </label>
                        <input 
                          v-model="method.returnType"
                          type="text"
                          placeholder="e.g., void, Promise<string>, boolean"
                          class="w-full px-3 py-2 rounded-lg border text-sm"
                          :class="isDarkMode 
                            ? 'border-gray-700 bg-slate-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'"
                        />
                        <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                          Methods must return Promise. Use "Promise&lt;void&gt;" for no return value.
                        </p>
                      </div>
                      <div class="col-span-2">
                        <label class="block text-xs font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Description</label>
                        <input 
                          v-model="method.description"
                          type="text"
                          placeholder="What this method does and when to use it"
                          class="w-full px-3 py-2 rounded-lg border text-sm"
                          :class="isDarkMode 
                            ? 'border-gray-700 bg-slate-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'"
                        />
                      </div>
                    </div>
                  </div>
                  <div v-if="componentData.methods.length === 0" class="text-center py-6">
                    <div class="max-w-md mx-auto">
                      <span class="material-symbols-outlined text-3xl mb-2 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">functions</span>
                      <p class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        No methods added
                      </p>
                      <p class="text-xs mb-3" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                        Methods are optional. Use them to expose public functionality that parent components can call (e.g., "open", "close", "reset").
                      </p>
                      <div 
                        class="p-3 rounded-lg text-left"
                        :class="isDarkMode 
                          ? 'bg-slate-800 border border-gray-700' 
                          : 'bg-gray-50 border border-gray-200'"
                      >
                        <p class="text-xs font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                          Example: Add an "open" method
                        </p>
                        <ul class="text-xs space-y-1 ml-4 list-disc" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                          <li>Name: <code class="px-1 py-0.5 rounded" :class="isDarkMode ? 'bg-slate-700' : 'bg-gray-200'">open</code></li>
                          <li>Return Type: <code class="px-1 py-0.5 rounded" :class="isDarkMode ? 'bg-slate-700' : 'bg-gray-200'">Promise&lt;void&gt;</code></li>
                          <li>Description: "Opens the component"</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 4: Preview & Generate -->
            <div v-if="currentStep === 3" class="space-y-6">
              <div>
                <h2 class="text-2xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Preview & Generate
                </h2>
                <p class="text-sm mb-3" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Review your component configuration and generate the Stencil.js code, tests, and documentation.
                </p>
                <div 
                  class="p-3 rounded-lg mb-4"
                  :class="isDarkMode 
                    ? 'bg-green-900/20 border border-green-800' 
                    : 'bg-green-50 border border-green-200'"
                >
                  <p class="text-xs" :class="isDarkMode ? 'text-green-300' : 'text-green-700'">
                    <strong>✅ What You'll Get:</strong> The wizard generates a complete Stencil.js component file (.tsx), unit tests (.spec.tsx), documentation (Markdown), and a README. All code follows Stencil.js best practices and web component standards.
                  </p>
                </div>
              </div>

              <div v-if="generatedComponent" class="space-y-4">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Generated Files</h3>
                    <div class="flex items-center gap-2">
                      <button 
                        v-for="file in ['component', 'test', 'documentation', 'readme']"
                        :key="file"
                        @click="activeFile = file"
                        class="px-3 py-1 rounded text-sm font-medium transition-colors capitalize"
                        :class="activeFile === file
                          ? (isDarkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white')
                          : (isDarkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
                      >
                        {{ file }}
                      </button>
                    </div>
                  </div>

                  <div class="rounded-lg border p-4 max-h-96 overflow-auto"
                    :class="isDarkMode 
                      ? 'border-gray-700 bg-slate-900' 
                      : 'border-gray-300 bg-gray-50'"
                  >
                    <pre class="text-sm font-mono" :class="isDarkMode ? 'text-gray-300' : 'text-gray-800'"><code>{{ getActiveFileContent() }}</code></pre>
                  </div>

                  <div class="flex items-center gap-2 mt-2">
                    <button 
                      @click="copyActiveFile"
                      class="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      Copy {{ activeFile }}
                    </button>
                    <button 
                      @click="downloadAll"
                      class="px-4 py-2 rounded-lg border transition-colors text-sm font-medium"
                      :class="isDarkMode 
                        ? 'border-gray-700 text-gray-300 hover:bg-slate-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
                    >
                      Download All
                    </button>
                  </div>
                </div>
              </div>

              <div v-else class="text-center py-12">
                <div class="max-w-lg mx-auto">
                  <span class="material-symbols-outlined text-5xl mb-4 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">code</span>
                  <h3 class="text-lg font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Ready to Generate
                  </h3>
                  <p class="text-sm mb-6" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    Click the button below to generate your Stencil.js component code, tests, and documentation. You'll be able to preview and download all files.
                  </p>
                  <button 
                    @click="generateComponent"
                    :disabled="generating || !componentData.name || !componentData.description || !componentData.category"
                    class="px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                  >
                    <span class="material-symbols-outlined">{{ generating ? 'hourglass_empty' : 'auto_fix_high' }}</span>
                    {{ generating ? 'Generating...' : 'Generate Component' }}
                  </button>
                  <p v-if="!componentData.name || !componentData.description || !componentData.category" class="text-xs mt-3" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                    Please complete Step 1 (Basic Information) before generating.
                  </p>
                </div>
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="flex items-center justify-between mt-8 pt-6 border-t"
              :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
            >
              <button 
                @click="previousStep"
                :disabled="currentStep === 0"
                class="px-6 py-2 rounded-lg border transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                :class="isDarkMode 
                  ? 'border-gray-700 text-gray-300 hover:bg-slate-700 disabled:hover:bg-transparent' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 disabled:hover:bg-transparent'"
              >
                Previous
              </button>
              <button 
                v-if="currentStep < steps.length - 1"
                @click="nextStep"
                class="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium"
              >
                Next
              </button>
              <button 
                v-else
                @click="createComponent"
                :disabled="creating"
                class="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ creating ? 'Creating...' : 'Create Component' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Dropdown from '../components/Dropdown.vue';

const API_BASE_URL = 'http://localhost:3000/api/v1';
const API_KEY = 'test-api-key-123';

const router = useRouter();
const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const currentStep = ref(0);
const selectedTemplateId = ref(null);
const templates = ref([]);
const generatedComponent = ref(null);
const activeFile = ref('component');
const generating = ref(false);
const creating = ref(false);

const steps = [
  { title: 'Basic Info', key: 'basic' },
  { title: 'Properties', key: 'properties' },
  { title: 'Events & Methods', key: 'events' },
  { title: 'Generate', key: 'generate' },
];

const componentData = reactive({
  name: '',
  description: '',
  category: '',
  status: 'in-progress',
  props: [],
  events: [],
  methods: [],
  slots: ['default'],
  styles: {},
  accessibility: {},
});

const categoryOptions = [
  { value: 'form', label: 'Form' },
  { value: 'display', label: 'Display' },
  { value: 'navigation', label: 'Navigation' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'layout', label: 'Layout' },
  { value: 'data', label: 'Data' },
  { value: 'custom', label: 'Custom' },
];

const statusOptions = [
  { value: 'production', label: 'Production Ready' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'planned', label: 'Planned' },
  { value: 'deprecated', label: 'Deprecated' },
  { value: 'experimental', label: 'Experimental' },
];

const propTypeOptions = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'object', label: 'Object' },
  { value: 'array', label: 'Array' },
  { value: 'function', label: 'Function' },
  { value: 'date', label: 'Date' },
  { value: 'enum', label: 'Enum' },
];

const templateOptions = computed(() => {
  return [
    { value: '', label: 'Start from scratch' },
    ...templates.value.map(t => ({ value: t.id, label: t.name })),
  ];
});

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const loadTemplates = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/component-scaffolding/templates`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    templates.value = response.data || [];
  } catch (error) {
    console.error('Error loading templates:', error);
    templates.value = [];
  }
};

const loadTemplate = async (templateId) => {
  if (!templateId) return;
  
  try {
    const template = await axios.get(`${API_BASE_URL}/component-scaffolding/templates/${templateId}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    if (template.data) {
      componentData.name = template.data.name;
      componentData.description = template.data.description;
      componentData.category = template.data.category;
      componentData.props = template.data.defaultProps.map(p => ({
        ...p,
        optionsString: p.options?.join(', ') || '',
      }));
      componentData.styles = template.data.defaultStyles;
      componentData.slots = template.data.defaultSlots;
    }
  } catch (error) {
    console.error('Error loading template:', error);
  }
};

const addProperty = () => {
  componentData.props.push({
    name: '',
    type: 'string',
    defaultValue: '',
    required: false,
    reflect: false,
    mutable: false,
    description: '',
    optionsString: '',
  });
};

const removeProperty = (index) => {
  componentData.props.splice(index, 1);
};

const updatePropOptions = (index, value) => {
  componentData.props[index].options = value.split(',').map(v => v.trim()).filter(v => v);
};

const addEvent = () => {
  componentData.events.push({
    name: '',
    detail: '',
    bubbles: true,
    cancelable: true,
    composed: true,
    description: '',
  });
};

const removeEvent = (index) => {
  componentData.events.splice(index, 1);
};

const addMethod = () => {
  componentData.methods.push({
    name: '',
    returnType: 'void',
    parameters: [],
    description: '',
  });
};

const removeMethod = (index) => {
  componentData.methods.splice(index, 1);
};

const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++;
  }
};

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const generateComponent = async () => {
  generating.value = true;
  try {
    // Prepare props for API (convert optionsString to options array)
    const propsForApi = componentData.props.map(prop => {
      const { optionsString, ...rest } = prop;
      return {
        ...rest,
        options: prop.type === 'enum' && optionsString ? optionsString.split(',').map(v => v.trim()).filter(v => v) : undefined,
      };
    });

    const input = {
      ...componentData,
      props: propsForApi,
    };

    const response = await axios.post(
      `${API_BASE_URL}/component-scaffolding/scaffold`,
      input,
      { headers: { Authorization: `Bearer ${API_KEY}` } }
    );
    
    generatedComponent.value = response.data;
  } catch (error) {
    console.error('Error generating component:', error);
    alert('Failed to generate component. Please try again.');
  } finally {
    generating.value = false;
  }
};

const createComponent = async () => {
  if (!generatedComponent.value) {
    await generateComponent();
  }

  creating.value = true;
  try {
    const propsForApi = componentData.props.map(prop => {
      const { optionsString, ...rest } = prop;
      return {
        ...rest,
        options: prop.type === 'enum' && optionsString ? optionsString.split(',').map(v => v.trim()).filter(v => v) : undefined,
      };
    });

    const input = {
      ...componentData,
      props: propsForApi,
    };

    const response = await axios.post(
      `${API_BASE_URL}/component-scaffolding/create`,
      input,
      { headers: { Authorization: `Bearer ${API_KEY}` } }
    );
    
    if (response.data.success) {
      // Navigate to the component page
      router.push(`/components/${response.data.componentId}`);
    }
  } catch (error) {
    console.error('Error creating component:', error);
    alert('Failed to create component. Please try again.');
  } finally {
    creating.value = false;
  }
};

const getActiveFileContent = () => {
  if (!generatedComponent.value) return '';
  
  switch (activeFile.value) {
    case 'component':
      return generatedComponent.value.componentCode;
    case 'test':
      return generatedComponent.value.testCode;
    case 'documentation':
      return generatedComponent.value.documentation;
    case 'readme':
      return generatedComponent.value.readme;
    default:
      return '';
  }
};

const copyActiveFile = async () => {
  const content = getActiveFileContent();
  try {
    await navigator.clipboard.writeText(content);
    alert('Copied to clipboard!');
  } catch (error) {
    console.error('Error copying:', error);
    alert('Failed to copy to clipboard.');
  }
};

const downloadAll = () => {
  if (!generatedComponent.value) return;
  
  const componentName = componentData.name.toLowerCase().replace(/\s+/g, '-');
  const files = [
    { name: `${componentName}.tsx`, content: generatedComponent.value.componentCode },
    { name: `${componentName}.spec.tsx`, content: generatedComponent.value.testCode },
    { name: `${componentName}.md`, content: generatedComponent.value.documentation },
    { name: 'README.md', content: generatedComponent.value.readme },
  ];

  files.forEach(file => {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
};

let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
  // Auto-open drawer if navigating from sidebar
  if (sessionStorage.getItem('openDrawerOnLoad') === 'true') {
    drawerOpen.value = true;
    sessionStorage.removeItem('openDrawerOnLoad');
  }
  
  loadTemplates();
  
  darkModeObserver = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  
  darkModeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
  
  const checkDarkMode = () => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  };
  
  checkDarkMode();
  darkModeInterval = setInterval(checkDarkMode, 100);
});

onBeforeUnmount(() => {
  if (darkModeObserver) {
    darkModeObserver.disconnect();
  }
  if (darkModeInterval) {
    clearInterval(darkModeInterval);
  }
});
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

