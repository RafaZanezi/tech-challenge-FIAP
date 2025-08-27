export class ClientAdapter {


    databaseToResponseAdapter(data: any): any {
        return {
            id: data.id,
            name: data.name,
            identifier: data.email
        };
    }



}