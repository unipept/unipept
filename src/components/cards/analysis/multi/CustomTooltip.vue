<template>
    <div
        class="tooltip-wrapper"
        @mouseenter="startShowTooltipTimer"
        @mouseleave="cancelShowTooltipTimer"
    >
        <slot></slot>
        <div
            v-if="visible"
            class="custom-tooltip"
            ref="tooltip"
            @mouseenter="cancelHideTooltipTimer"
            @mouseleave="startHideTooltipTimer"
        >
            Missed cleavage handling is now always enabled. Because of a change in
            Unipept's underlying search engine, enabling missed cleavage handling no
            longer results in a performance penalty. As a result, this configuration
            option will be removed in a future release. See
            <a
                href="https://github.com/unipept/unipept/wiki/Unipept-Next"
                target="_blank"
                rel="noopener noreferrer"
                class="text-white"
            >this page</a>
            for more information.
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

// State variables for tooltip visibility and timers
const visible = ref(false);
let showTooltipTimer: number | null = null;
let hideTooltipTimer: number | null = null;

// Function to start the timer for showing the tooltip
const startShowTooltipTimer = () => {
    cancelHideTooltipTimer();
    if (showTooltipTimer !== null) {
        clearTimeout(showTooltipTimer);
        showTooltipTimer = null;
    } // Clear any existing show timer
    showTooltipTimer = window.setTimeout(() => {
        visible.value = true;
    }, 300); // Show tooltip after 300ms
};

// Function to cancel the show tooltip timer
const cancelShowTooltipTimer = () => {
    if (showTooltipTimer !== null) {
        clearTimeout(showTooltipTimer);
        showTooltipTimer = null;
    }
    startHideTooltipTimer();
};

// Function to start the timer for hiding the tooltip
const startHideTooltipTimer = () => {
    cancelHideTooltipTimer(); // Clear any existing hide timer
    hideTooltipTimer = window.setTimeout(() => {
        visible.value = false;
    }, 1000); // Hide tooltip after 1 second
};

// Function to cancel the hide tooltip timer
const cancelHideTooltipTimer = () => {
    if (hideTooltipTimer !== null) {
        clearTimeout(hideTooltipTimer);
        hideTooltipTimer = null;
    }
};
</script>

<style scoped>
.tooltip-wrapper {
    position: relative;
    display: inline-block;
    overflow: visible; /* Ensure the tooltip is not clipped by the parent */
}

.custom-tooltip {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: #323232;
    color: #fff;
    padding: 8px;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    margin-bottom: 8px;
    transition: opacity 0.2s ease-in-out;
    pointer-events: auto; /* Allows interaction with tooltip content */
    max-width: 400px; /* Maximum width for the tooltip */
    width: max-content; /* Ensures tooltip takes the minimum width necessary */
    overflow: hidden; /* Ensures content doesn't overflow */
    white-space: normal; /* Allows text to wrap within the tooltip */
    line-height: 1.4; /* Improves readability with line spacing */
}

.custom-tooltip a {
    color: #1e88e5; /* Style for the link */
    text-decoration: underline;
}

.custom-tooltip a:hover {
    color: #1565c0;
}
</style>
