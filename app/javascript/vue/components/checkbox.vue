<template>
    <div class="checkbox">
        <label title="" class="js-has-hover-tooltip" :for="name" :data-original-title="tooltip">
            <input type="checkbox" :name="name" :id="name" checked="checked"> {{ label }}
        </label>
    </div>
</template>

<script>
    export default {
        name: "checkbox",
        data: function() {
            return {
                content: '',
                valid: true
            }
        },
        props: {
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
        }
    };
</script>

<style scoped>

</style>
