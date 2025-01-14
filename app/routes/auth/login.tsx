import type { Route } from "./+types/login";

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Login" }, { name: "description", content: "Login" }];
}

export default function Login() {
    return (
        <div>
            <h1 className="text-black">Login</h1>
        </div>
    );
}
