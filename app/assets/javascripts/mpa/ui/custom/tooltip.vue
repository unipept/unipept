<template>
  <v-tooltip top>
    <template v-slot:activator="{ on }">
      <span v-on="on">
       <slot></slot>
      </span>
    </template>
    <span>{{ message }}</span>
  </v-tooltip>
</template>

<script lang='ts'>
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import {Prop, Watch} from 'vue-property-decorator'

  @Component
  export default class Tooltip extends Vue {
    @Prop()
    private message: string;
  }
</script>

<style scoped>
</style>