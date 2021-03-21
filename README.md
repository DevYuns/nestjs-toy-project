# Nest를 활용한 백엔드 구축

## 사용한 기술

- [Nestjs](https://docs.nestjs.com/)
- [GraphQL](https://graphql.org/)
- [TypeOrm](https://typeorm.io/#/)
- [postgresQL](https://www.postgresql.org/)

### .ENV

아래 명령어를 터미널에서 실행

> `cp .env.sample .env.dev`

- `env` variables

  | Name        | default | required | description  |
  | ----------- | ------- | -------- | ------------ |
  | DB_HOST     |         | yes      |              |
  | ROOT_URL    |         | yes      |              |
  | DB_USERNAME |         | yes      |              |
  | DB_PASSWORD |         | yes      |              |
  | DB_NAME     |         | yes      |              |
  | SECRET_KEY  |         | yes      | For jwtToken |

### 프로젝트 설치

```
npm i
```

### 프로젝트 시작

```sh
npm run start:dev
```

## User Models:

- id
- createdAt
- updatedAt

- email
- password
- role(client|owner|delivery)

## User CRUD:

-Create Account

- Log In
- See Profile
- Edit Profile
- Verify Email
