import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { T } from '../../libs/types/common';
import { Member } from '../../libs/dto/member/member';
import { JwtService } from '@nestjs/jwt';
import { shapeOfMongoObjectId } from '../../libs/config';

@Injectable()
export class AuthService {
	constructor(private jwtService: JwtService) {}
	//hasPassword
	public async hasPassword(memberPassword: string): Promise<string> {
		const salt = await bcrypt.genSalt();
		return await bcrypt.hash(memberPassword, salt);
	}

	// comparePasswords
	public async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
		return await bcrypt.compare(password, hashedPassword);
	}

	// createToken
	public async createToken(member: Member): Promise<string> {
		console.log('member:', member);
		const payload: T = {};

		Object.keys(member['_doc'] ? member['_doc'] : member).map((ele) => {
			payload[`${ele}`] = member[`${ele}`];
		});
		delete payload.memberPassword;
		console.log('payload:', payload);

		return await this.jwtService.signAsync(payload);
	}

	// verifyToken
	public async verifyToken(token: string): Promise<Member> {
		const member = await this.jwtService.verifyAsync(token);
        member._id = shapeOfMongoObjectId(member._id)
		return member;
	}
}
