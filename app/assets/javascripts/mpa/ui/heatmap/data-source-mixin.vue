<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import DataSource from "../../datasource/DataSource";

    @Component
    export default class DataSourceMixin extends Vue {
        @Prop({required: true})
        protected dataSource: DataSource;
    }
</script>
