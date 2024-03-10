import { getAllUserInfo } from "@/utils/apiUtils";
import prisma from "@/lib/prisma";
import formidable, {errors as formidableErrors} from 'formidable';
import { z } from 'zod'

import { S3Client } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'


export default async function handler(req, res) {
	const user = await getAllUserInfo(req);

	if (!user) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	const form = formidable({});
	let fields;
    let files;

	try {
        [fields, files] = await form.parse(req);
    } catch (err) {
        return res.status(400).json({ error: "An error occured" });
    }

	const formSchema = z.object({
		file: z.any(),
		name: z.string().min(1, {
			message: "Name must not be empty",
		}),
		description: z.string().min(1, {
			message: "Description must not be empty",
		}),
		longDescription: z.string().min(1, {
			message: "Long description must not be empty",
		}),
		banner: z.any()
	})

	try {
		formSchema.parse({
			file: files.file[0],
			name: fields.name[0],
			description: fields.description[0],
			longDescription: fields.longDescription[0],
			banner: files.banner[0],
		});
	} catch (err) {
		return res.status(400).json({ error: "Validation error" });
	}

	// prisma validation

	// upload to bucket
	const client = new S3Client({ region: process.env.AWS_REGION })
	const bucket = process.env.AWS_BUCKET_NAME
	

	// create prisma stuff

	return res.status(200).json({ message: "Created" });
}

export const config = {
	api: {
		bodyParser: false,
	},
};