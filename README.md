# rescale-takehome

This project took approximately 3-4 hours to complete.

### Project Setup
after installing this repository, you can build and run the project with the following commands:
```bash
make build
make up
```

To run the Playwright tests, ensure the project is running, then run:
```
make test
```
To stop and cleanup the instance, run:
```
make stop
make clean
```

### AI usage
I used Claude to co-develop this project. After creating the basic models and serializers with the help of some Googling, I asked Claude to implement indexing and pagination to consider the scaling aspect of this problem. After creating the initial dashboard in the frontend, I left spots for Claude to create 2 components for me: the JobRow and Modal. For the scope of this project, I wanted the Modal to be multi-functional because it is used for both displaying errors and requesting confirmation for deleting. Since there was only one kind of row for this project, I did not want to abstract the JobRow any further. I also described the UI elements and asked Claude to write the CSS for me. Finally, I asked Claude to create a script to seed my database with data, and asked it to create the Docker related files.

