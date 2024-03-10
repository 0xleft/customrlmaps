import { getUserRoles, hasRole } from "@/utils/userUtils";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";


const IsAdmin = ({ children }) => {
	const { user, isLoaded } = useUser();
	const router = useRouter();
	if (!isLoaded) return null;

	const userRoles = getUserRoles(user);
    
    return (
		<>
            {hasRole(userRoles, "admin") && children}
		</>
 );
};

export default IsAdmin;