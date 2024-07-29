export class orders {
  id: number = 0;
  nr: string = '';
  cliente: string = '';
  dataH: Date | undefined;
  prioridade: string = '';
  status: number = 0;
  entregador?: string;
  dataEntrega?: Date;
  observacao?: string = '';
  isOpen: boolean = false; 
}


