import {EcNamespace} from "@/logic/communicators/unipept/functional/EcResponse";
import {GoNamespace} from "@/logic/communicators/unipept/functional/GoResponse";
import {InterproNamespace} from "@/logic/communicators/unipept/functional/InterproResponse";

export type FunctionalNamespace = EcNamespace | GoNamespace | InterproNamespace;

export interface FunctionalDefinition<T extends FunctionalNamespace> {
    code: string;
    name: string;
    namespace: T;
}
