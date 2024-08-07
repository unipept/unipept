<template>
    <v-alert
        icon="$info"
        type="info"
    >
      <template #text>
        <div>
          Missed cleavage handling is now enabled by default. Because of a change in Unipept's underlying search engine,
          enabling missed cleavage no longer results in a performance penalty and the configuration option will be removed
          in a future release. See <a class="text-white" href="https://github.com/unipept/unipept/wiki/Unipept-Next">this page</a>
          for more information on this change.
        </div>
      </template>
    </v-alert>
</template>

<style scoped>

</style>
<script setup lang="ts">
</script>