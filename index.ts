import express, {NextFunction, Response, Request, response,}  from "express";
import { request } from "http";
import { v4 as uuid } from "uuid";

type TechnologiesType = {
    id: string
    title: string
    studied: boolean
    deadline: Date
    created_at: Date
}

type UsersType = {
    id: string
    name: string
    username: string
    technologies: TechnologiesType[]
}

const usuarios = [] as UsersType[];

const server = express();

server.use(express.json());

type BodyType = {
    name: string;
    username: string;
};

type BodyTechType = {
    title: string;
    deadline: Date;
}


function checkExistsUserAccount(request: Request, response: Response, next: NextFunction){
    const { username } = request.body as { username: string };
    
    const userExists = usuarios.some(user => user.username === username);
    if (userExists) {
        return response.status(400).json({
            message: 'Usuário já existe'
        });
    }
    
    next();
}

server.post('/users', checkExistsUserAccount, (request, response) => {
   const {name, username} = request.body as BodyType;

   const UserNew = {
    id: uuid(),
    name,
    username,
    technologies: []
   }

    usuarios.push(UserNew);

    return response.status(201).json({
        message: 'Usuário foi cadastrado',
        user: UserNew
    })

}) 
        
server.get('/users/technologies', checkExistsUserAccount, (request, response) => {
    const username = request.header('username');
    const user = usuarios.find(user => user.username === username);

    if (!user) {
        return response.status(404).json({
            message: 'Usuário não encontrado'
        });
    }
    return response.status(200).json({
        technologies: user.technologies
    });
})

server.post('/users/technologies',checkExistsUserAccount,(request, response) =>{
    const username = request.header('username');
    const user = usuarios.find(user => user.username === username);
    const {title, deadline} = request.body as BodyTechType;

    const TechNew = {
        id: uuid(),
        title,
        studied: false,
        deadline: new Date(deadline),
        created_at: new Date(), 
    }

    if (!user) {
        return response.status(404).json({
            message: 'Usuário não encontrado'
        });
    }

    user.technologies.push(TechNew)
    return response.status(200).json({
        technologies: user.technologies
    })
})

server.put('/users/technologies/:id',checkExistsUserAccount,(request, response) =>{
    const username = request.header('username');
    const {title, deadline} = request.body as BodyTechType;
    const idReq = request.params.id;

    const user = usuarios.find(user => user.username === username);
    const technology = user?.technologies.find(tech => tech.id === idReq);

    if (!technology) {
        return response.status(404).json({
            message: 'Tecnologia não encontrada'
        });
    }

    technology.title = title;
    technology.deadline = deadline;

    return response.status(200).json({
        technology

    })

})

server.patch('/users/technologies/:id',checkExistsUserAccount,(request, response) => {
    const username = request.header('username');
    const idReq = request.params.id;

    const user = usuarios.find(user => user.username === username);
    const technology = user?.technologies.find(tech => tech.id === idReq);

    if (!technology) {
        return response.status(404).json({
            message: 'Tecnologia não encontrada'
        });
    }
    technology.studied = true;
    return response.status(200).json({
        technology
    })
    
})

server.delete('/users/technologies/:id',checkExistsUserAccount,(request, response) => {
    const username = request.header('username');
    const idReq = request.params.id;

    const user = usuarios.find(user => user.username === username);

    if (!user) {
        return response.status(404).json({
            message: 'Usuário não encontrado'
        });
    }
    const technology = user?.technologies.findIndex(tech => tech.id === idReq);

    if (technology === -1) {
        return response.status(404).json({
            message: 'Tecnologia não encontrada'
        });
    }

    user!.technologies.splice(technology, 1);

    return response.status(200).json({
        message: 'Tecnologia removida'
    });

})

server.listen('3333', () => {
    console.log('server online on port 3333');
  });
