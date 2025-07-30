//#region Imports
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Const } from './const.entity';
import { NotFoundException } from '@nestjs/common';
//#endregion

@Injectable()
export class constService {
    //#region Constructor
    constructor(
        @InjectRepository(Const)
        private readonly constRepo: Repository<Const>,
    ) {}
    //#endregion

    //#region Sepete Ürün Ekleme (Add Const)
    async addConst(data: { user_id: number; product_id: number; amount: number; }) {
        const amount = await this.checkIfProductAlreadyInBasket(data.user_id, data.product_id);
        var const0;
        if (amount === 0) {
            const0 = this.constRepo.create(data);
            return this.constRepo.save(const0);
        } else if (amount !== null) {
            data.amount = data.amount + amount;
            const0 = await this.constRepo.increment({ user_id: data.user_id, product_id: data.product_id }, "amount", 1);
            return "1";
        }
    }
    //#endregion

    //#region ID ye göre Const Alma
    async getConstById(id: number): Promise<Const> {
        const const0 =  await this.constRepo.findOneBy({ id });
        if (!const0) {
        throw new NotFoundException(`Const with id ${id} not found`);
        }
        return const0;
    }
    //#endregion

    //#region User ID sine göre Sepetteki Ürünleri Alma
    async getUsersConstsById(id: number) {
        const const0 = await this.constRepo.find({where: {id}})
        return const0;
    }
    //#endregion

    //#region Ürün zaten Sepette varmi kontrol et
    async checkIfProductAlreadyInBasket(userid: number, productid: number): Promise<number | null> {
        const amountOfProduct = await this.constRepo.findOne({where: {user_id: userid, product_id: productid}, select: ['amount']});
        if (amountOfProduct === null) {
            return 0;
        }
        return amountOfProduct.amount;
    }
    //#endregion

    //#region Ürünün Sepetteki sayisini artir
    async increaseAmount(userid: number, productid: number): Promise<String> {
        var amountOfProduct = await this.constRepo.findOne({where: {user_id: userid, product_id: productid}, select: ['id', 'amount']});
        if (amountOfProduct != null) {
            await this.constRepo.update({id: amountOfProduct.id}, {amount: amountOfProduct.amount + 1});
            return `${amountOfProduct.amount + 1}`;
        } else {
            return "0";
        }
    }
    //#endregion

    //#region Ürünü Sepetten kaldir
    async deleteConst(userid: number, productid: number): Promise<String> {
        try {
            await this.constRepo.delete({user_id: userid, product_id: productid})
            return "1";
        } catch {
            return "0";
        }
    }
    //#endregion

    //#region User ID ye göre Sepetteki tüm ürünleri alma
    async getValuesByUserID(userid: number) {
        const rows = await this.constRepo.find({where: {user_id: userid}, select: ['product_id', 'amount']})
        const product_idList = rows.map(r => r.product_id);
        const amountList = rows.map(r => r.amount);
        return [product_idList, amountList];
    }
    //#endregion

    //#region Sepetteki ürünün sepetteki miktarini azaltma
    async decreaseAmount(userid: number, productid: number): Promise<String> {
        var amountOfProduct = await this.constRepo.findOne({where: {user_id: userid, product_id: productid}, select: ['id', 'amount']});
        if (amountOfProduct != null) {
            if (amountOfProduct.amount === 1) {
                await this.constRepo.delete({user_id: userid, product_id: productid})
                return "0";
            } else {
                await this.constRepo.update({id: amountOfProduct.id}, {amount: amountOfProduct.amount - 1});
                return `${amountOfProduct.amount - 1}`;
            }
        } else {
            return "0";
        }
    }
    //#endregion
}
