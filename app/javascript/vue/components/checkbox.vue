<template>
    <div class="checkbox">
        <label title="" class="js-has-hover-tooltip" :for="name" :data-original-title="tooltip">
            <input v-model="content" type="checkbox" :name="name" :id="name"> {{ label }}
        </label>
    </div>
</template>

<script>
    export default {
        name: "checkbox",
        data: function() {
            return {
                content: this.value,
                valid: true
            }
        },
        props: {
            value: {
                type: Boolean,
                default: true
            },
            name: {
                type: String
            },
            label: {
                type: String
            },
            autofocus: {
                type: Boolean,
                default: false
            },
            placeholder: {
                type: String,
                deafult: ""
            },
            tooltip: {
                type: String,
                default: ""
            }
        },
        watch: {
            content(val) {
                this.$emit('input', val);
            }
        }
    };
</script>

<style scoped>

</style>
