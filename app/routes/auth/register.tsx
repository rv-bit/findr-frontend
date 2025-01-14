import type { Route } from "./+types/register";

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Register" }, { name: "description", content: "Register" }];
}

export default function Register() {
    return (
        <div>
            <h1 className="text-black">Register</h1>
        </div>
    );
}
