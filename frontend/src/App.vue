<template>
  <v-app>
    <div class="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:bg-slate-900 flex flex-col">
      <div class="flex flex-1 min-h-0">
        <Sidebar />
        <div class="flex-1 min-w-0 flex flex-col">
          <TopNav />
          <main class="flex-1 overflow-auto bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:bg-slate-900">
            <router-view :key="$route.path" />
          </main>
        </div>
      </div>
    </div>
  </v-app>
</template>

<script setup>
import Sidebar from './components/Sidebar.vue';
import TopNav from './components/TopNav.vue';
</script>

