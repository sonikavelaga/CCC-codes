#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <conio.h>   // for getch()

#define STUD_FILE "students.txt"
#define CRE_FILE  "credentials.txt"

char currentUser[50];
char currentRole[20];

/* function prototypes */
void getCurrentDateTime(char *buffer);
void signup();
int  login();
int  isAdmin();

void addStudent();
void displayStudents();
void searchStudent();
void deleteStudent();
void updateMarks();
void getPassword(char *pass);   // password input with *
const char* calculateGrade(float mark);  // grade calculation

/* GET CURRENT DATE/TIME */
void getCurrentDateTime(char *buffer) {
    time_t t = time(NULL);
    struct tm tm = *localtime(&t);
    sprintf(buffer, "%02d-%02d-%04d %02d:%02d:%02d",
            tm.tm_mday, tm.tm_mon + 1, tm.tm_year + 1900,
            tm.tm_hour, tm.tm_min, tm.tm_sec);
}

/* READ PASSWORD AS ***** */
void getPassword(char *pass) {
    int i = 0;
    char ch;

    while (1) {
        ch = getch();        // read char without echo
        if (ch == 13) {      // Enter key
            break;
        } else if (ch == 8) { // Backspace
            if (i > 0) {
                i--;
                printf("\b \b");
            }
        } else {
            if (i < 49) {    // avoid overflow
                pass[i++] = ch;
                printf("*");
            }
        }
    }
    pass[i] = '\0';
}

/* GRADE CALCULATION */
const char* calculateGrade(float mark) {
    if (mark >= 90) return "A+";
    else if (mark >= 80) return "A";
    else if (mark >= 70) return "B";
    else if (mark >= 60) return "C";
    else if (mark >= 50) return "D";
    else return "F";
}

/* SIGN UP */
void signup() {
    char username[50], password[50], role[20];
    printf("Enter Username: ");
    scanf("%s", username);

    printf("Enter Password: ");
    getPassword(password);   // masked input
    printf("\n");

    printf("Enter Role (admin/staff/guest): ");
    scanf("%s", role);

    FILE *fp = fopen(CRE_FILE, "a");
    if (!fp) {
        printf("Error opening credentials file!\n");
        return;
    }

    fprintf(fp, "%s %s %s\n", username, password, role);
    fclose(fp);

    printf("Signup successful! Please login.\n");
}

/* LOGIN WITH 3 PASSWORD ATTEMPTS */
int login() {
    char u[50], p[50], r[20];
    char inUser[50], inPass[50];
    int attempts;
    int userFound = 0;

    printf("====== LOGIN ======\n");
    printf("USERNAME: ");
    scanf("%s", inUser);

    FILE *fp = fopen(CRE_FILE, "r");
    if (!fp) {
        printf("No credentials found. Sign up first.\n");
        return 0;
    }

    while (fscanf(fp, "%s %s %s", u, p, r) == 3) {
        if (strcmp(inUser, u) == 0) {
            userFound = 1;
            attempts = 3;

            while (attempts > 0) {
                printf("PASSWORD (%d attempts left): ", attempts);
                getPassword(inPass);
                printf("\n");

                if (strcmp(inPass, p) == 0) {
                    strcpy(currentUser, u);
                    strcpy(currentRole, r);
                    fclose(fp);
                    return 1;
                } else {
                    printf("Wrong Password!\n");
                    attempts--;
                }
            }

            printf("Too many wrong attempts. Login failed.\n");
            fclose(fp);
            return 0;
        }
    }

    fclose(fp);
    if (!userFound)
        printf("User Not Found! Login Failed.\n");

    return 0;
}

/* CHECK IF CURRENT USER IS ADMIN */
int isAdmin() {
    return (strcmp(currentRole, "admin") == 0 ||
            strcmp(currentRole, "ADMIN") == 0);
}

/* ADD STUDENT */
void addStudent() {
    FILE *fp = fopen(STUD_FILE, "a");
    if (!fp) { printf("Cannot open student file!\n"); return; }

    int roll, sem;
    float mark;
    char name[50], course[20], degree[20], datetime[50];

    printf("Enter Roll Number: "); scanf("%d", &roll); getchar();
    printf("Enter Name: "); fgets(name,50,stdin);
    if(name[strlen(name)-1]=='\n') name[strlen(name)-1]='\0';
    printf("Enter Course: "); scanf("%s", course);
    printf("Enter Degree: "); scanf("%s", degree);
    printf("Enter Semester: "); scanf("%d", &sem);
    printf("Enter Marks: "); scanf("%f", &mark);

    getCurrentDateTime(datetime);

    fprintf(fp,"%d %s %s %s %d %.2f %s\n",
            roll, name, course, degree, sem, mark, datetime);

    fclose(fp);

    printf("Student Record Added Successfully! Grade: %s\n", calculateGrade(mark));
}

/* DISPLAY STUDENTS */
void displayStudents() {
    FILE *fp = fopen(STUD_FILE, "r");
    if (!fp) { printf("No Student Records Found!\n"); return; }

    int roll, sem;
    float mark;
    char name[50], course[20], degree[20], datetime[50];
    const char *grade;

    printf("\nRoll\tName\tCourse\tDegree\tSem\tMarks\tGrade\tDate/Time\n");
    printf("-----------------------------------------------------------------------------\n");

    while (fscanf(fp,"%d %s %s %s %d %f %[^\n]",
                  &roll,name,course,degree,&sem,&mark,datetime)==7) {

        grade = calculateGrade(mark);

        printf("%d\t%s\t%s\t%s\t%d\t%.2f\t%s\t%s\n",
               roll,name,course,degree,sem,mark,grade,datetime);
    }

    fclose(fp);
}

/* SEARCH STUDENT */
void searchStudent() {
    int choice;
    printf("Search by (1.Roll / 2.Name): ");
    scanf("%d",&choice); getchar();

    int roll, sem, found=0;
    float mark;
    char name[50], course[20], degree[20], datetime[50], searchName[50];
    const char *grade;

    FILE *fp = fopen(STUD_FILE,"r");
    if(!fp) { printf("No records.\n"); return; }

    if(choice==1) {
        int sroll;
        printf("Enter Roll: ");
        scanf("%d",&sroll);

        while(fscanf(fp,"%d %s %s %s %d %f %[^\n]",
                     &roll,name,course,degree,&sem,&mark,datetime)==7) {
            if(roll==sroll){
                grade = calculateGrade(mark);
                printf("Found: %d %s %s %s %d %.2f Grade: %s %s\n",
                       roll,name,course,degree,sem,mark,grade,datetime);
                found=1;
                break;
            }
        }
    }
    else {
        printf("Enter Name: ");
        fgets(searchName,50,stdin);
        if(searchName[strlen(searchName)-1]=='\n')
            searchName[strlen(searchName)-1]='\0';

        while(fscanf(fp,"%d %s %s %s %d %f %[^\n]",
                     &roll,name,course,degree,&sem,&mark,datetime)==7) {
            if(strcmp(name,searchName)==0){
                grade = calculateGrade(mark);
                printf("Found: %d %s %s %s %d %.2f Grade: %s %s\n",
                       roll,name,course,degree,sem,mark,grade,datetime);
                found=1;
            }
        }
    }

    if(!found) printf("Student Not Found!\n");

    fclose(fp);
}

/* DELETE STUDENT */
void deleteStudent() {
    int droll;
    printf("Enter Roll Number to Delete: ");
    scanf("%d",&droll);

    FILE *fp = fopen(STUD_FILE,"r");
    if(!fp){ printf("No Records Found!\n"); return; }

    FILE *temp = fopen("temp.txt","w");
    int roll, sem, deleted=0;
    float mark;
    char name[50], course[20], degree[20], datetime[50];

    while(fscanf(fp,"%d %s %s %s %d %f %[^\n]",
                 &roll,name,course,degree,&sem,&mark,datetime)==7) {

        if(roll == droll) {
            deleted = 1;
            continue; // skip writing this record
        }
        fprintf(temp,"%d %s %s %s %d %.2f %s\n",
                roll,name,course,degree,sem,mark,datetime);
    }

    fclose(fp);
    fclose(temp);

    remove(STUD_FILE);
    rename("temp.txt", STUD_FILE);

    if(deleted)
        printf("Student Record Deleted Successfully!\n");
    else
        printf("Roll Number Not Found!\n");
}

/* UPDATE MARKS */
void updateMarks() {
    int uroll;
    printf("Enter Roll Number to Update Marks: ");
    scanf("%d", &uroll);

    FILE *fp = fopen(STUD_FILE, "r");
    if (!fp) {
        printf("No Records Found!\n");
        return;
    }

    FILE *temp = fopen("temp.txt", "w");
    if (!temp) {
        printf("Error opening temp file!\n");
        fclose(fp);
        return;
    }

    int roll, sem, updated = 0;
    float mark, newMarks;
    char name[50], course[20], degree[20], datetime[50], newDatetime[50];
    const char *grade;

    while (fscanf(fp,"%d %s %s %s %d %f %[^\n]",
                  &roll,name,course,degree,&sem,&mark,datetime)==7) {

        if (roll == uroll) {
            grade = calculateGrade(mark);
            printf("Current Record:\n");
            printf("%d %s %s %s %d %.2f Grade: %s %s\n",
                   roll,name,course,degree,sem,mark,grade,datetime);

            printf("Enter New Marks: ");
            scanf("%f", &newMarks);

            getCurrentDateTime(newDatetime);

            fprintf(temp,"%d %s %s %s %d %.2f %s\n",
                    roll,name,course,degree,sem,newMarks,newDatetime);

            printf("Updated Grade: %s\n", calculateGrade(newMarks));

            updated = 1;
        } else {
            fprintf(temp,"%d %s %s %s %d %.2f %s\n",
                    roll,name,course,degree,sem,mark,datetime);
        }
    }

    fclose(fp);
    fclose(temp);

    remove(STUD_FILE);
    rename("temp.txt", STUD_FILE);

    if (updated)
        printf("Marks Updated Successfully!\n");
    else
        printf("Roll Number Not Found!\n");
}

/* MAIN */
int main() {
    int choice;
    printf("1. Sign Up\n2. Login\nChoose Option: ");
    scanf("%d",&choice); getchar();

    if(choice==1)
        signup();

    if(!login()){
        printf("Invalid login!\n");
        return 0;
    }

    printf("\nLogin Successful! Role: %s\n", currentRole);

    int menu;
    while(1){
        printf("\n1.Add Student  2.Display  3.Search  4.Delete  5.Update Marks  6.Exit\nChoose: ");
        scanf("%d",&menu); getchar();

        if(menu==1) {
            if (isAdmin())
                addStudent();
            else
                printf("Access Denied: Only ADMIN can add students.\n");
        }
        else if(menu==2) {
            displayStudents();
        }
        else if(menu==3) {
            searchStudent();
        }
        else if(menu==4) {
            if (isAdmin())
                deleteStudent();
            else
                printf("Access Denied: Only ADMIN can delete students.\n");
        }
        else if(menu==5) {
            if ( isAdmin() ||
                 strcmp(currentRole, "staff") == 0 ||
                 strcmp(currentRole, "STAFF") == 0 ) {

                updateMarks();
            } else {
                printf("Access Denied: Only ADMIN or STAFF can update marks.\n");
            }
        }
        else if(menu==6) {
            printf("Exiting...\n");
            break;
        }
        else {
            printf("Invalid Option!\n");
        }
    }

    return 0;
}

