<template>
    <v-card>
        <card-header>
            <card-title>
                Search for a single tryptic peptide
            </card-title>
        </card-header>
        <v-card-text>
            <v-row>
                <v-col cols="9" class="py-0">
                    <v-form ref="form">
                        <v-text-field
                            v-on:keyup.enter="search()"
                            label="Sequence"
                            v-model="sequence"
                            :rules="rules">
                        </v-text-field>
                    </v-form>
                </v-col>
                <v-col cols="3" class="py-0" style="display: flex; justify-content: center; align-items: flex-end;">
                    <v-btn @click="search()" color="primary" class="white--text" width="100%">
                        <v-icon dark>mdi-magnify</v-icon>
                        Search
                    </v-btn>
                </v-col>
            </v-row>
            <v-checkbox dense hide-details v-model="equateIl" class="mt-0" label="Equate I and L?"></v-checkbox>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import CardHeader from "unipept-web-components/src/components/custom/CardHeader.vue";
import CardTitle from "unipept-web-components/src/components/custom/CardTitle.vue";
import { Watch } from "vue-property-decorator";
import { VForm } from "vuetify/lib";

@Component({
    components: {
        CardHeader,
        CardTitle
    }
})
export default class SearchPeptideCard extends Vue {
    private sequence: string = "";
    private equateIl: boolean = true;

    private rules = [
        (input: string) => /^[A-Z]+$/.test(input.toUpperCase()) ? true : "Peptide can only consist of letters",
        (input: string) => input.length >= 5 && input.length <= 50 ? true : "Peptide should consist of 5 to 50 characters"
    ];

    private search() {
        if ((this.$refs.form as VForm).validate()) {
            this.$emit("search", this.sequence.toUpperCase(), this.equateIl);
        }
    }
}
</script>

<style>
    label {
        margin-bottom: 0;
    }
</style>
