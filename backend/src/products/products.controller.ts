import { Controller, Get } from '@nestjs/common';

@Controller('api/products')
export class ProductsController {
  @Get()
  getAll() {
    return [
      { id: 1, name: 'T-shirt', price: 19.99 },
      { id: 2, name: 'Mug', price: 7.5 },
      { id: 3, name: 'Cap', price: 14.99 }
    ];
  }
}
