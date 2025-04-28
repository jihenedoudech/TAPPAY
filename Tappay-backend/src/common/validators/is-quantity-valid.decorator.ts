import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
  } from 'class-validator';
import { UnitOfMeasure } from '../../products/enums/unit-of-mesure.enum';
  
  export function IsQuantityValid() {
    return function (object: Object, propertyName: string) {
      registerDecorator({
        name: 'isQuantityValid',
        target: object.constructor,
        propertyName: propertyName,
        validator: {
          validate(value: any, args: ValidationArguments) {
            const unitOfMeasure = args.object['unitOfMeasure']; // Access the unit of measure
            if (unitOfMeasure === UnitOfMeasure.PIECE) {
              return Number.isInteger(value) && value > 0; // For 'Piece', quantity must be a positive integer
            }
            if (unitOfMeasure === UnitOfMeasure.LITER || unitOfMeasure === UnitOfMeasure.KILOGRAM) {
              return value > 0; // For 'Liter', quantity must be a positive number
            }
            console.log('unitOfMeasure in validator', unitOfMeasure);
            return false; // Invalid for other unit types
          },
          defaultMessage(args: ValidationArguments) {
            const unitOfMeasure = args.object['unitOfMeasure'];
            return `Quantity must be ${
              unitOfMeasure === 'Piece' ? 'an integer' : 'a positive number'
            } for unit of measure ${unitOfMeasure}.`;
          },
        },
      });
    };
  }
  