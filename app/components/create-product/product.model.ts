interface IProductTO{
    name: string;
    description: string;
    category: string;
    drugName: string;
    manifacturer: string;
    location: string;
}

export default class ProductTO {
    public name: string;
    public description: string;
    public category: string;
    public drugName: string;
    public manifacturer: string;
    public location: string;
    constructor();
    constructor(productTO?: IProductTO){
        this.name = productTO && productTO.name || undefined;
        this.description = productTO && productTO.description || undefined;
        this.category = productTO && productTO.category || undefined;
        this.drugName = productTO && productTO.drugName || undefined;
        this.manifacturer = productTO && productTO.manifacturer || undefined;
        this.location = productTO && productTO.location || undefined;
    }
    public isEmpty(): Boolean{
        return ! (this.name || this.description || this.category || this.drugName || this.manifacturer || this.location );
    }
}
