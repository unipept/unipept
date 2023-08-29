<template>
    <div class="boxed">
        <slot />
    </div>
</template>

<style scoped>
.boxed {
    display: block !important;
    border: 1px solid #cccccc !important;
    border-radius: 2px !important;
    padding: 8px !important;
    background-color: #f5f5f5 !important;
    line-height: 1.5 !important;
    margin-bottom: 12px !important;
    max-height: 350px !important;
    font-size: 90% !important;
    font-family: monospace;
    white-space: nowrap;
    overflow-x: scroll;
}
</style>
