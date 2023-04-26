import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { AuthService } from "src/app/auth/services/auth.service";

@Component({
    selector: "ml-menu",
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: "./menu.component.html",
    styleUrls: ["./menu.component.scss"],
})
export class MenuComponent implements OnInit {
    logged?: boolean;
    constructor(
        private readonly http: AuthService,
        private readonly router: Router
    ) {}

    ngOnInit(): void {
        this.http.loginChange$.subscribe((bol) => {
            this.logged = bol;
        });
    }

    logout(): void {
        this.http.logout();
        this.router.navigate(["auth/login"]);
    }
}
