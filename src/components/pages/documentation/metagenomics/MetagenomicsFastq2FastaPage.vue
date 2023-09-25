<template>
    <v-container>
        <h1 class="font-weight-light">
            umgap fastq2fasta
        </h1>
        <h3 class="font-weight-light">
            Interleaves <initialism>FASTQ</initialism> files into a <initialism>FASTA</initialism> stream
        </h3>

        <v-divider class="my-2" />

        <p>
            The <inline-code>umgap fastq2fasta</inline-code> command takes one or more <initialism>FASTQ</initialism> files and interleaves them into a
            single <initialism>FASTA</initialism> file.
        </p>

        <header-body-card
            id="usage"
            title="Usage"
            large-title
        >
            <p>
                The <initialism>FASTQ</initialism> input files are given as command line arguments. In order, a single record is taken
                from each of these files, and the record header and sequence are written to <i>standard output</i> in <initialism>FASTA</initialism>
                format, dropping the quality scores, until any of the files runs out or records.
            </p>

            <p>
                This command is generally used to combine two paired-end <initialism>FASTQ</initialism> files into a single
                <initialism>FASTA</initialism> file.
            </p>

            <boxed style="max-height: fit-content">
                <sentinel>$</sentinel> <b>cat input_1.fq</b>
                <br>@record1/1
                <br>GATAGCCGTCGAGCGTCCCGACATCCATATACAGCTCGCCGCAGTGCGTCGCCCGCACGGCATCGCGCGCCGCGATGTACGCATTCAACCAGCGTCCGAG
                <br>+
                <br>AADGGGG&lt;GI@IIKJKKKKH4EIJCHJ9:IJHKIKDIKDKGDJD@C@&lt;>KD=;FEA:DA=I$EEED$>C@1EDE?D:CEAC;CDE:E$D$=D$EAD?AEE
                <br>@record2/1
                <br>CCCAGGTCCCCGGCATCGTCGCGGCCTCGCCCATGATCCAGCTCCACGACCAGATCCCCGTTCCCGGCGGTAAAGAGCGCGGCGTGCTCATCCTCGGAGT
                <br>+
                <br>ADDEEG@GIGIIHKCJKH@HHGKHHKHKKJJBA.GFIGK(IHKKEKECBEEEEDIKC@H&lt;EDBJDEA36;6EE$E:G6C=E$E@CE?EE9FEE?E:F$?$
                <br><sentinel>$</sentinel> <b>cat input_2.fq</b>
                <br>@record1/2
                <br>CATTGTTCGCTACTTTGCGGAGCGCAATTATGCCGCGGAGATCTTCTACGTGGTGCAGCAGAAGCTGGCGGGCTGGTGCGATGCGTTGTATCGGCCCGAG
                <br>+
                <br>DDDEGGG?HIHIIKHK?@2KBHGDCJKI(JEJJKKHKKHBHKKFICEICECCFFEICCCC$E6ED$?CEEDDED$DEDCFFECEEEEFB$CCEC$6C=CA
                <br>@record2/2
                <br>GGACACGCTCTCAGGACGATGGCGCGATTGCAGGACTTGCTGGATCTCCTCCGTCGCCAAGGGGACGCGCTCGGAGTGGCTCATGGAGCAGACGAGTTCT
                <br>+
                <br>AADGGGEGIIIHIJKGCK&lt;KD:KKHI?HIHHJKFJEKKJIGE$CKHE$EE$FEEEI=EAE8EAIKFBEE$EADEEDB$DEEDE=?B6C$C$6$A$$=BEE
                <br><sentinel>$</sentinel> <b>umgap fastq2fasta input_1.fq input_2.fq</b>
                <br>>record1/1
                <br>GATAGCCGTCGAGCGTCCCGACATCCATATACAGCTCGCCGCAGTGCGTCGCCCGCACGGCATCGCGCGCCGCGATGTACGCATTCAACCAGCGTCCGAG
                <br>>record1/2
                <br>CATTGTTCGCTACTTTGCGGAGCGCAATTATGCCGCGGAGATCTTCTACGTGGTGCAGCAGAAGCTGGCGGGCTGGTGCGATGCGTTGTATCGGCCCGAG
                <br>>record2/1
                <br>CCCAGGTCCCCGGCATCGTCGCGGCCTCGCCCATGATCCAGCTCCACGACCAGATCCCCGTTCCCGGCGGTAAAGAGCGCGGCGTGCTCATCCTCGGAGT
                <br>>record2/2
                <br>GGACACGCTCTCAGGACGATGGCGCGATTGCAGGACTTGCTGGATCTCCTCCGTCGCCAAGGGGACGCGCTCGGAGTGGCTCATGGAGCAGACGAGTTCT
            </boxed>
        </header-body-card>
    </v-container>
</template>

<script setup lang="ts">
import InlineCode from '@/components/highlights/InlineCode.vue';
import HeaderBodyCard from '@/components/cards/HeaderBodyCard.vue';
import Initialism from '@/components/highlights/Initialism.vue';
import Boxed from '@/components/highlights/Boxed.vue';
import Sentinel from '@/components/highlights/Sentinel.vue';
</script>
