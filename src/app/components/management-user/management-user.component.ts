import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DialogConfirmComponent } from 'src/app/dialogs/dialog-confirm.component';
import { User } from 'src/app/models/User';
import { UsersService } from 'src/app/services/UsersService';

@Component({
  selector: 'management-user',
  templateUrl: './management-user.component.html',
  styleUrls: ['./management-user.component.css']
})
export class ManagementUserComponent implements OnInit {
  filterControl: FormControl;
  users: User[] = [];
  filteredUsers: User[] = [];

  editedUser?: User;
  editUserControl: FormControl;
  editUserAdminControl: FormControl;

  dialogRefSubscription: Subscription;

  connectedUser: User;

  constructor(private router: Router,
              private usersService: UsersService,
              private formBuilder: FormBuilder,
              private snackBar: MatSnackBar,
              private dialog: MatDialog) {
   }

  ngOnInit(): void {
    this.usersService.getUsers().subscribe((users: User[]) => {
      this.users = users;
      this.filteredUsers = users;

      this.filterControl = this.formBuilder.control('');

      this.filterControl.valueChanges.subscribe(filterValue => {
          if (filterValue) {
              this.filteredUsers = this.users.filter(user => user.username.includes(filterValue));
          } else {
              this.filteredUsers = this.users;
          }
      });
  });

  this.editUserControl = this.formBuilder.control(['', [Validators.minLength(3), Validators.maxLength(50)]]);
  this.editUserAdminControl = this.formBuilder.control(false, [Validators.required]);

  this.usersService.connectedUserSubject.subscribe((user: User) => {
    this.connectedUser = user;
  }); 
  this.usersService.emitConnectedUser();

  }

  userIsAdmin(user: User): string {
    return (user.admin === true) ? 'Oui' : 'Non';
  }

  connectedUserIsAdmin(): boolean {
    return this.connectedUser.admin!;
  }

  onChangeEditedUser(user: User): void {
    this.editedUser = (this.editedUser === user) ? undefined : user;
    this.editUserControl.setValue(user.username);
  }

  onEditUser(user: User): void {       // MARCHE PAS !!
    console.log(this.editUserAdminControl.value);
    console.log(this.editUserControl.value);

    const userToSet: User = {
      id: user.id,
      username: this.editUserControl.value,
      password: user.password,
      passwordConfirm: user.passwordConfirm,
      oldPassword: user.oldPassword,
      messages: [],
      topics: [],
      isAdmin:this.editUserAdminControl.value, 
      connectedUser: this.connectedUser 
    }

    if (this.editUserControl.valid) {
      this.usersService.updateUser(userToSet).subscribe((user: User) => {
          this.usersService.users = this.usersService.users.map((userElt: User) => {
              if (userElt.id === user.id) {
                userElt.username = user.username;
                userElt.admin = user.admin;
              }
              return userElt;
           });

           this.usersService.emitUsers();

           this.snackBar.open('L\'utilisateur a bien été modifié', 'Fermer', { duration: 3000 });

           this.editedUser = undefined;
      }, error => {
          this.snackBar.open('Une erreur est survenue. Veuillez vérifier votre saisie', 'Fermer', { duration: 3000 });
      });
  }
  }

  onDeleteUser(user: User): void {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
          title: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
          content: 'Cette action est irréversible.',
          action: 'Supprimer'
      },
      autoFocus: false
    });

    this.dialogRefSubscription = dialogRef.afterClosed().subscribe(confirm => {
        if (confirm) {
            this.usersService.deleteUser(user).subscribe(response => {
                this.usersService.users = this.usersService.users.filter(userElt => userElt.id !== user.id);
                this.usersService.emitUsers();
    
                this.editedUser = undefined;
    
                this.snackBar.open('L\'utilisateur a bien été supprimé', 'Fermer', { duration: 3000 });
            }, error => {
                this.snackBar.open('Une erreur est survenue. Veuillez vérifier votre saisie', 'Fermer', { duration: 3000 });
            });
        }
    });
    }

}
