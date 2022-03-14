export default class MapData{
    id:number;
    data:any[];
    
    constructor(id:number,data:any[]){
        this.id = id;
        this.data = data;
    }

    public addData(data:any){
        this.data.push(data);
    }
}