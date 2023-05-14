import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ComicCardComponent } from "../comics/comic-card/comic-card.component";
import { ActivatedRoute, Router } from "@angular/router";
import { Comic } from "../comics/interfaces/comics";
import { Auth } from "../auth/interfaces/auth";
import { UsersService } from "./services/users.service";
import {
    FormControl,
    FormGroup,
    NonNullableFormBuilder,
    ReactiveFormsModule,
    Validators,
} from "@angular/forms";
import Swal from "sweetalert2";
import { isTheSame } from "../shared/validators/isTheSame";
import { ImageCroppedEvent, ImageCropperModule } from "ngx-image-cropper";
import { ComicsService } from "../comics/services/comics.service";

@Component({
    selector: "ml-users",
    standalone: true,
    imports: [
        CommonModule,
        ComicCardComponent,
        ReactiveFormsModule,
        ImageCropperModule,
    ],
    templateUrl: "./users.component.html",
    styleUrls: ["./users.component.scss"],
})
export class UsersComponent implements OnInit {
    comics: Comic[]=[];
    userId: string = localStorage.getItem("user-id") || "";
    isMe!: boolean;

    favourites
    userForm!: FormGroup;
    nameControl!: FormControl<string>;
    emailControl!: FormControl<string>;

    passForm!: FormGroup;
    passwordControl!: FormControl<string>;
    password2Control!: FormControl<string>;

    imageChangedEvent: any = "";
    croppedImage: any = "";

    newAvatar = "";

    user: Auth = {
        email: "",
        avatar: "",
    };

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private userService: UsersService,
        private readonly comicService: ComicsService,
        private readonly fb: NonNullableFormBuilder
    ) {}

    ngOnInit(): void {
        this.route.data.subscribe((user) => {
            if (user["user"]) {
                this.user = user["user"];
            } else {
                this.userService
                    .getUser(this.userId)
                    .subscribe((u) => (this.user = u));
            }
        });

        this.isMe = this.userId === this.user._id?.toString();

        this.nameControl = this.fb.control("", [
            Validators.required,
            Validators.pattern("[a-zA-Z ]+"),
        ]);

        this.emailControl = this.fb.control("", [
            Validators.required,
            Validators.email,
        ]);

        this.userForm = this.fb.group({
            name: this.nameControl,
            email: this.emailControl,
        });

        this.passwordControl = this.fb.control("", [
            Validators.required,
            Validators.pattern(
                "^(?=.*[!@#$%&/.()=+?\\[\\]~\\-^0-9])[a-zA-Z0-9!@#$%&./()=+?\\[\\]~\\-^]{8,}$"
            ),
        ]);
        this.password2Control = this.fb.control("", [
            Validators.required,
            isTheSame(this.passwordControl),
        ]);

        this.passForm = this.fb.group({
            password: this.passwordControl,
            password2: this.password2Control,
        });

        this.user.favorites.map((idComic) => {
            this.comicService.getIdComic(idComic).subscribe({
              next:(comic)=>{
                console.log(comic);
                this.comics.push(comic);
              }
            });
        });
    }

    saveUser(): void {
        Swal.fire({
            title: "¿Seguro que quieres el usuario?",
            showDenyButton: true,
            confirmButtonText: "Confirmar",
            denyButtonText: "Cerrar",
        }).then((result) => {
            if (result.isConfirmed) {
                this.userService
                    .saveProfile(
                        this.nameControl.value,
                        this.emailControl.value
                    )
                    .subscribe({
                        next: () => {
                            Swal.fire({
                                title: "Usuario guardado",
                                icon: "success",
                            });
                            this.router.navigate(["/users", this.userId]);
                        },
                        error: (err) => {
                            Swal.fire({
                                title: "Usuario descartado",
                                text: err,
                                icon: "error",
                            });
                            this.router.navigate(["/users", this.userId]);
                        },
                    });
                return true;
            } else {
                Swal.fire({
                    title: "Usuario descartado",
                    icon: "error",
                });
                return false;
            }
        });
    }

    savePassword(): void {
        Swal.fire({
            title: "¿Seguro que quieres cambiar la contraseña?",
            showDenyButton: true,
            confirmButtonText: "Confirmar",
            denyButtonText: "Cerrar",
        }).then((result) => {
            if (result.isConfirmed) {
                this.userService
                    .savePassword(
                        this.passwordControl.value,
                        this.password2Control.value
                    )
                    .subscribe({
                        next: () => {
                            Swal.fire({
                                title: "Contraseña guardada",
                                icon: "success",
                            });
                            this.router.navigate(["/users/", this.userId]);
                        },
                        error: (err) => {
                            console.log(err);
                            Swal.fire({
                                title: "Contraseña descartada",
                                text: err,
                                icon: "error",
                            });
                            this.router.navigate(["/users", this.userId]);
                        },
                    });
                return true;
            } else {
                Swal.fire({
                    title: "Contraseña descartada",
                    icon: "error",
                });
                return false;
            }
        });
    }

    saveAvatar(): void {
        Swal.fire({
            title: "¿Seguro que quieres cambiar el avatar?",
            showDenyButton: true,
            confirmButtonText: "Confirmar",
            denyButtonText: "Cerrar",
        }).then((result) => {
            if (result.isConfirmed) {
                console.log(this.user.avatar);
                this.userService
                    .saveAvatar(
                        this.newAvatar,
                        this.user.name!,
                        this.user.avatar!
                    )
                    .subscribe({
                        next: () => {
                            Swal.fire({
                                title: "Avatar guardado",
                                icon: "success",
                            });
                            this.router.navigate(["/users", this.userId]);
                        },
                        error: (err) => {
                            console.log(err);
                            Swal.fire({
                                title: "Avatar descartada",
                                text: err,
                                icon: "error",
                            });
                            this.router.navigate(["/users", this.userId]);
                        },
                    });
                return true;
            } else {
                Swal.fire({
                    title: "Contraseña descartada",
                    icon: "error",
                });
                return false;
            }
        });
    }

    fileChangeEvent(event: unknown): void {
        this.imageChangedEvent = event;
    }
    imageCropped(event: ImageCroppedEvent) {
        this.croppedImage = event.base64;
    }
    saveImage() {
        this.newAvatar = this.croppedImage;
    }

    validClasses(
        ngModel: FormControl,
        validClass = "is-valid",
        errorClass = "is-invalid"
    ): object {
        return {
            [validClass]: ngModel.touched && ngModel.valid,
            [errorClass]: ngModel.touched && ngModel.invalid,
        };
    }
}
