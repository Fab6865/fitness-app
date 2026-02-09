# 💪 PERFORMANCE - Application Fitness

Application de musculation et fitness avec programmes personnalisés, timer automatique et système de badges !

## 🚀 INSTALLATION (ÉTAPE PAR ÉTAPE)

### 1️⃣ **INSTALLER NODE.JS** (si tu l'as pas déjà)

Va sur https://nodejs.org et télécharge la version LTS (Long Term Support).
Double-clique sur l'installeur et suis les étapes.

Pour vérifier que c'est installé :
```bash
node --version
npm --version
```

### 2️⃣ **TÉLÉCHARGER LE PROJET**

Récupère tous les fichiers du projet et mets-les dans un dossier, par exemple `C:\fitness-app`

### 3️⃣ **OUVRIR UN TERMINAL**

**Sur Windows :**
- Ouvre le dossier du projet
- Clique droit dans le dossier (pas sur un fichier)
- Choisis "Ouvrir dans le terminal" ou "Git Bash here"

**Sur Mac/Linux :**
- Ouvre le Terminal
- Tape `cd /chemin/vers/ton/dossier/fitness-app`

### 4️⃣ **INSTALLER LES DÉPENDANCES**

Dans le terminal, tape cette commande et appuie sur Entrée :
```bash
npm install
```

⏳ Ça va télécharger plein de trucs (React, Tailwind, etc.). Attends que ça finisse (peut prendre 1-2 minutes).

### 5️⃣ **INSTALLER TAILWIND CSS**

Après l'installation, tape :
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 6️⃣ **LANCER L'APPLICATION**

Tape :
```bash
npm start
```

🎉 **BOOM !** Ton navigateur va s'ouvrir automatiquement sur `http://localhost:3000`

L'app est lancée ! Tu peux l'utiliser direct !

---

## 📱 METTRE SUR GITHUB + CRÉER L'APK

### 1️⃣ **CRÉER UN BUILD POUR LA PRODUCTION**

```bash
npm run build
```

Ça va créer un dossier `build/` avec tous les fichiers optimisés.

### 2️⃣ **PUSH SUR GITHUB**

```bash
git init
git add .
git commit -m "Premier commit - App fitness"
git branch -M main
git remote add origin https://github.com/TON-USERNAME/fitness-app.git
git push -u origin main
```

### 3️⃣ **ACTIVER GITHUB PAGES**

1. Va sur ton repo GitHub
2. Clique sur "Settings"
3. Dans le menu à gauche, clique sur "Pages"
4. Dans "Source", choisis "main" et le dossier `/build`
5. Clique sur "Save"

⏳ Attends 2-3 minutes, GitHub va déployer ton site !

### 4️⃣ **RÉCUPÉRER LE LIEN**

Ton site sera disponible sur : `https://TON-USERNAME.github.io/fitness-app/`

### 5️⃣ **CRÉER L'APK**

1. Va sur https://www.websitetoapk.com/
2. Colle ton lien GitHub Pages
3. Configure les options (nom de l'app, icône, etc.)
4. Télécharge l'APK
5. Transfère-le sur ton téléphone !

---

## 📁 STRUCTURE DU PROJET

```
fitness-app/
├── public/
│   └── index.html          # Page HTML de base
├── src/
│   ├── App.jsx            # TON APPLICATION (tout le code est ici !)
│   ├── index.js           # Point d'entrée
│   └── index.css          # Styles CSS + Tailwind
├── package.json           # Configuration du projet
├── tailwind.config.js     # Config Tailwind
└── README.md             # Ce fichier !
```

---

## 🎮 FONCTIONNALITÉS

✅ 3 programmes (Débutant / Intermédiaire / Avancé)
✅ Timer automatique avec countdown et bips sonores
✅ 12 badges à débloquer (Bronze / Argent / Or)
✅ Suivi de progression et statistiques
✅ Liens vidéo personnalisables (mets tes vidéos Tibo InShape !)
✅ Sauvegarde automatique avec localStorage
✅ Tous tes équipements : rameur, vélo, sac de frappe, poids, élastiques, roulette abdos, corde à sauter !

---

## 🛠️ COMMANDES UTILES

**Lancer l'app en développement :**
```bash
npm start
```

**Créer un build de production :**
```bash
npm run build
```

**Arrêter l'app :**
Appuie sur `Ctrl + C` dans le terminal

---

## 💡 ASTUCES

**L'app ne se lance pas ?**
- Vérifie que Node.js est bien installé : `node --version`
- Réinstalle les dépendances : `npm install`
- Supprime `node_modules/` et refais `npm install`

**Modifier le code :**
- Ouvre `src/App.jsx` avec ton éditeur de code
- Modifie ce que tu veux
- Sauvegarde
- L'app se recharge automatiquement ! 🔥

**Changer les couleurs / styles :**
- C'est du Tailwind CSS
- Les classes sont directement dans le JSX (exemple : `className="bg-orange-500"`)

---

## 🎯 PROCHAINES ÉTAPES

1. ✅ Installe Node.js
2. ✅ Lance `npm install`
3. ✅ Lance `npm start`
4. ✅ Teste l'app
5. ✅ Personnalise les liens vidéo dans les paramètres
6. ✅ Fais ton premier workout et débloque des badges !
7. ✅ Quand t'es prêt, build et push sur GitHub
8. ✅ Crée ton APK !

---

## 🔥 C'EST PARTI !

T'as tout ce qu'il faut, maintenant **GO GO GO** ! 💪

Si tu bloques quelque part, regarde bien les messages d'erreur dans le terminal, souvent ça dit exactement ce qui va pas !

**BON COURAGE POUR TES WORKOUTS !** 🏋️‍♂️🔥
