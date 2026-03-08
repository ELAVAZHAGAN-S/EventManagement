import AttendeeLayout from "../layout/AttendeeLayout"
import ProfileLayout from "./ProfileLayout"

const ProfileSettings = () => {

    const storedUser = localStorage.getItem("user")
    const user = storedUser ? JSON.parse(storedUser) : null

    if(user?.role === "ORGANIZATION"){
        return <ProfileLayout/>
    }

    return (
        <AttendeeLayout>
            <ProfileLayout/>
        </AttendeeLayout>
    )
}

export default ProfileSettings