import Visitor from "./Visitor";

export default interface Visitable
{
    visit(visitor: Visitor) : Promise<void>;
}