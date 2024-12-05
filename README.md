# Dogopedia
# 🐾 Wikipedia o Psach – Społecznościowa Platforma Wymiany Doświadczeń

## Opis projektu
Dogopedia to inaczej wikipedia o Psach to społecznościowa platforma internetowa zaprojektowana, aby umożliwić właścicielom psów wymianę doświadczeń, porad i informacji na temat opieki nad psami. Naszym celem jest stworzenie bezpiecznego, przyjaznego środowiska, które łączy miłośników psów z całego świata.

## Funkcjonalności
- 🌟 **Baza wiedzy**: Zawiera artykuły oparte na doświadczeniach użytkowników i sprawdzonych źródłach.
- 🗣️ **Forum dyskusyjne**: Przestrzeń do zadawania pytań i dzielenia się poradami.
- 🔎 **Filtrowanie**: Znajdź konkretne treści związane z rasami, zdrowiem czy treningiem psów.

## Technologie
Projekt został zbudowany przy użyciu:
- **Frontend**: React.js,
- **Backend**: Python, Flask
- **Baza danych**: MySQL
- **Hosting**: 
- **Inne**: 

## Instalacja
Aby uruchomić projekt lokalnie, wykonaj poniższe kroki:

### Wymagania wstępne
- 

### Krok 1: Klonowanie repozytorium
git clone https://github.com/DKalinowsky/Dogopedia.git

### Krok 2: Odpal docker compose
docker compose up --build

### Krok 3: Skonfiguruj bazę danych (Powinno się robić automatycznie przy buildzie, ale nie działa)
docker exec -it mysql bash
mysql -u root -p
root
SOURCE /docker-entrypoint-initdb.d/init.sql;
