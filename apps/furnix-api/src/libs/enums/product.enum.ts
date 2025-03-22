import { registerEnumType } from '@nestjs/graphql';

export enum ProductType {
	CHAIR = 'CHAIR',
	TABLE = 'TABLE',
	SOFA = 'SOFA',
	BED = 'BED',
	CABINET = 'CABINET',
	OTHER = 'OTHER',
}
registerEnumType(ProductType, {
	name: 'ProductType',
});

export enum ProductStatus {
	ACTIVE = 'ACTIVE',
	SOLD = 'SOLD',
	DELETE = 'DELETE',
}
registerEnumType(ProductStatus, {
	name: 'ProductStatus',
});



export enum ProductMaterials {
	WOOD = 'WOOD',
	METAL = 'METAL',
	PLASTIC = 'PLASTIC',
	GLASS = 'GLASS',
	FABRIC = 'FABRIC',
	OTHER = 'OTHER',
}

registerEnumType(ProductMaterials, {
	name: 'ProductMaterials',
});

export enum ProductLocation {
	NEW_YORK = 'NEW_YORK',
	LOS_ANGELES = 'LOS_ANGELES',
	CHICAGO = 'CHICAGO',
	HOUSTON = 'HOUSTON',
	MIAMI = 'MIAMI',
	DALLAS = 'DALLAS',
	ATLANTA = 'ATLANTA',
	DENVER = 'DENVER',
	SEATTLE = 'SEATTLE',
	SAN_FRANCISCO = 'SAN_FRANCISCO',
}
registerEnumType(ProductLocation, {
	name: 'ProductLocation',
});
