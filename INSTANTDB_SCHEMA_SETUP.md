# Configuración del Schema de InstantDB usando MCP

## App ID
`27acc1e8-fce9-4800-a9cd-c769cea6844f`

## Comandos para configurar el Schema

Ejecuta estos comandos en orden usando el MCP de InstantDB:

### 1. Crear Entidad: users
```
create_entity users
```

Agregar atributos:
```
add_attribute users email string
add_attribute users firstName string
add_attribute users lastName string
add_attribute users profileImageUrl string
add_attribute users role string
add_attribute users status string
add_attribute users createdAt number
```

### 2. Crear Entidad: playerProfiles
```
create_entity playerProfiles
```

Agregar atributos:
```
add_attribute playerProfiles userId string
add_attribute playerProfiles documentType string
add_attribute playerProfiles documentNumber string
add_attribute playerProfiles dateOfBirth string
add_attribute playerProfiles gender string
add_attribute playerProfiles phone string
add_attribute playerProfiles address string
add_attribute playerProfiles category string
add_attribute playerProfiles position string
add_attribute playerProfiles jerseyNumber number
add_attribute playerProfiles uniformSize string
add_attribute playerProfiles guardianName string
add_attribute playerProfiles guardianRelationship string
add_attribute playerProfiles guardianDocument string
add_attribute playerProfiles guardianPhone string
add_attribute playerProfiles guardianEmail string
add_attribute playerProfiles bloodType string
add_attribute playerProfiles allergies string
add_attribute playerProfiles medicalConditions string
add_attribute playerProfiles emergencyContact string
add_attribute playerProfiles emergencyPhone string
add_attribute playerProfiles gamesPlayed number
add_attribute playerProfiles goals number
add_attribute playerProfiles assists number
add_attribute playerProfiles createdAt number
```

### 3. Crear Entidad: categories
```
create_entity categories
```

Agregar atributos:
```
add_attribute categories name string
add_attribute categories ageMin number
add_attribute categories ageMax number
add_attribute categories description string
add_attribute categories trainingSchedule string
add_attribute categories objectives string
add_attribute categories imageUrl string
add_attribute categories createdAt number
```

### 4. Crear Entidad: coaches
```
create_entity coaches
```

Agregar atributos:
```
add_attribute coaches categoryId string
add_attribute coaches name string
add_attribute coaches role string
add_attribute coaches photoUrl string
add_attribute coaches bio string
add_attribute coaches experience string
add_attribute coaches createdAt number
```

### 5. Crear Entidad: newsPosts
```
create_entity newsPosts
```

Agregar atributos:
```
add_attribute newsPosts title string
add_attribute newsPosts content string
add_attribute newsPosts excerpt string
add_attribute newsPosts imageUrl string
add_attribute newsPosts status string
add_attribute newsPosts publishedAt number
add_attribute newsPosts createdAt number
```

### 6. Crear Entidad: tournaments
```
create_entity tournaments
```

Agregar atributos:
```
add_attribute tournaments name string
add_attribute tournaments categoryId string
add_attribute tournaments season string
add_attribute tournaments startDate string
add_attribute tournaments endDate string
add_attribute tournaments location string
add_attribute tournaments description string
add_attribute tournaments createdAt number
```

### 7. Crear Entidad: matches
```
create_entity matches
```

Agregar atributos:
```
add_attribute matches tournamentId string
add_attribute matches categoryId string
add_attribute matches date number
add_attribute matches opponent string
add_attribute matches location string
add_attribute matches homeScore number
add_attribute matches awayScore number
add_attribute matches result string
add_attribute matches notes string
add_attribute matches createdAt number
```

### 8. Crear Entidad: standings
```
create_entity standings
```

Agregar atributos:
```
add_attribute standings tournamentId string
add_attribute standings teamName string
add_attribute standings position number
add_attribute standings played number
add_attribute standings won number
add_attribute standings drawn number
add_attribute standings lost number
add_attribute standings goalsFor number
add_attribute standings goalsAgainst number
add_attribute standings goalDifference number
add_attribute standings points number
```

### 9. Crear Entidad: paymentConcepts
```
create_entity paymentConcepts
```

Agregar atributos:
```
add_attribute paymentConcepts name string
add_attribute paymentConcepts description string
add_attribute paymentConcepts amount number
add_attribute paymentConcepts frequency string
add_attribute paymentConcepts applicableCategories string
add_attribute paymentConcepts isActive boolean
add_attribute paymentConcepts createdAt number
```

### 10. Crear Entidad: accountsReceivable
```
create_entity accountsReceivable
```

Agregar atributos:
```
add_attribute accountsReceivable playerProfileId string
add_attribute accountsReceivable conceptId string
add_attribute accountsReceivable amount number
add_attribute accountsReceivable dueDate string
add_attribute accountsReceivable status string
add_attribute accountsReceivable description string
add_attribute accountsReceivable createdAt number
```

### 11. Crear Entidad: payments
```
create_entity payments
```

Agregar atributos:
```
add_attribute payments playerProfileId string
add_attribute payments amount number
add_attribute payments paymentDate string
add_attribute payments paymentMethod string
add_attribute payments referenceNumber string
add_attribute payments notes string
add_attribute payments receiptNumber string
add_attribute payments createdAt number
```

### 12. Crear Entidad: documents
```
create_entity documents
```

Agregar atributos:
```
add_attribute documents playerProfileId string
add_attribute documents type string
add_attribute documents fileUrl string
add_attribute documents fileName string
add_attribute documents status string
add_attribute documents notes string
add_attribute documents uploadedAt number
```

### 13. Crear Entidad: contactSubmissions
```
create_entity contactSubmissions
```

Agregar atributos:
```
add_attribute contactSubmissions name string
add_attribute contactSubmissions email string
add_attribute contactSubmissions phone string
add_attribute contactSubmissions subject string
add_attribute contactSubmissions message string
add_attribute contactSubmissions isRead boolean
add_attribute contactSubmissions createdAt number
```

### 14. Crear Entidad: galleryAlbums
```
create_entity galleryAlbums
```

Agregar atributos:
```
add_attribute galleryAlbums title string
add_attribute galleryAlbums description string
add_attribute galleryAlbums categoryId string
add_attribute galleryAlbums coverImageUrl string
add_attribute galleryAlbums createdAt number
```

### 15. Crear Entidad: galleryImages
```
create_entity galleryImages
```

Agregar atributos:
```
add_attribute galleryImages albumId string
add_attribute galleryImages imageUrl string
add_attribute galleryImages caption string
add_attribute galleryImages createdAt number
```

### 16. Crear Entidad: categoryAchievements
```
create_entity categoryAchievements
```

Agregar atributos:
```
add_attribute categoryAchievements categoryId string
add_attribute categoryAchievements title string
add_attribute categoryAchievements description string
add_attribute categoryAchievements year number
add_attribute categoryAchievements imageUrl string
add_attribute categoryAchievements createdAt number
```

## Relaciones (Links)

Si el MCP soporta crear links/relaciones:

```
# playerProfiles -> users
create_link playerProfiles userId users

# coaches -> categories
create_link coaches categoryId categories

# matches -> tournaments
create_link matches tournamentId tournaments

# matches -> categories
create_link matches categoryId categories

# standings -> tournaments
create_link standings tournamentId standings

# accountsReceivable -> playerProfiles
create_link accountsReceivable playerProfileId playerProfiles

# accountsReceivable -> paymentConcepts
create_link accountsReceivable conceptId paymentConcepts

# payments -> playerProfiles
create_link payments playerProfileId playerProfiles

# documents -> playerProfiles
create_link documents playerProfileId playerProfiles

# galleryAlbums -> categories
create_link galleryAlbums categoryId categories

# galleryImages -> galleryAlbums
create_link galleryImages albumId galleryAlbums

# categoryAchievements -> categories
create_link categoryAchievements categoryId categories
```

## Verificación

Después de ejecutar todos los comandos, verifica en el dashboard de InstantDB:
https://www.instantdb.com/dash?app=27acc1e8-fce9-4800-a9cd-c769cea6844f

Deberías ver todas las 16 entidades creadas con sus respectivos atributos.

## Datos de Prueba

Una vez configurado el schema, puedes agregar datos de prueba desde el dashboard o crear un script para poblar la base de datos.
