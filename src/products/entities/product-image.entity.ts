import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './';

@Entity({ name: 'product_images' })
export class ProductImage {
  @ApiProperty({
    example: 1,
    description: 'ID único de la imagen',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: '1740176-00-A_0_2000.jpg',
    description: 'URL o nombre del archivo de la imagen',
  })
  @Column('text')
  url: string;

  @ManyToOne(() => Product, (product) => product.images, { onDelete: 'CASCADE' })
  product: Product;
}