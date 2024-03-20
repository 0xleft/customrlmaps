import CustomError from "@/components/CustomError";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { Suspense } from "react";

export default function Search() {

	return (
		<>
			<div className='flex flex-row justify-center p-4 min-h-screen'>
                <div className='hidden lg:flex lg:w-[20%] p-2'>
					<Card className="w-full">
						<CardHeader>
							<CardTitle>
								Filters
							</CardTitle>
						</CardHeader>
						<CardContent>
						</CardContent>
					</Card>
                </div>

                <div className="w-full p-2 lg:w-[66%] min-h-screen">
                    <Card className="w-full h-full">
                        <CardHeader className="flex-col flex lg:hidden">
                                <CardTitle>
                                    <div className='flex flex-row items-center space-x-2'>
                                    </div>
                                </CardTitle>
                        </CardHeader>

                        <CardContent className="mt-0 lg:mt-4 min-h-screen">
						</CardContent>
                    </Card>
                </div>
            </div>
		</>
	);
}