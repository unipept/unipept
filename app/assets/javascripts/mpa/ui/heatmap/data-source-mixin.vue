<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import DataSource from "../../datasource/DataSource";

    @Component
    export default class DataSourceMixin extends Vue {
        @Prop({required: true})
        protected dataSource: DataSource;

        protected capitalize(input: string): string {
            console.log("Capital result: " + input.split(" ").map(el => el.length > 0 ? el.substr(0, 1).toUpperCase() + el.substr(1) : el).join(" "));
            return input.split(" ").map(el => el.length > 0 ? el.substr(0, 1).toUpperCase() + el.substr(1) : el).join(" ");
        }
    }
</script>
