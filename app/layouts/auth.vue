<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-50 px-4">
    <div class="w-full max-w-sm">
      <NuxtLink
        to="/"
        class="mb-6 flex items-center justify-center gap-2 text-xl font-extrabold text-slate-900"
      >
        <span class="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500 text-white">🏀</span>
        pball
      </NuxtLink>
      <slot />
    </div>
  </div>
</template>
