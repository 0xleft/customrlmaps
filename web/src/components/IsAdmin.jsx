import { useEffect, useState } from "react";

export default function IsAdmin({ children, isAdmin }) {
    return (
		<>
			{isAdmin ? (
				<>
					{children}
				</>
			) : null }
		</>
 );
};