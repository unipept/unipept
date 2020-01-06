declare module "worker-loader!*" 
{
    class WebpackWorker extends Worker {
        constructor();
    }

    export default WebpackWorker;
}

// declare module "*.vue" {
//     import Vue from "vue";
//     export default Vue;
// }

