import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Rock, Paper, Scissors';
  readonly APIUrl = "http://localhost:5257/api/RockPaperScissor";

  player1: { name: string, id: number } | null = null;
  player2: { name: string, id: number } | null = null;
  gameID: number | null = null; // Para almacenar el ID del juego
  player1Move: string = ''; // Para almacenar el movimiento del Jugador 1
  player2Move: string = ''; // Para almacenar el movimiento del Jugador 2
  currentTurn: number = 1; // 1 para Jugador 1, 2 para Jugador 2
  currentPlayer = 1; // Para controlar cuál jugador se está registrando
  message: string = '';
  showWelcomeMessage: boolean = false; // Para controlar la alerta de bienvenida
  isGameStarted = false; // Para verificar si el juego ha comenzado
  gameStartedMessage: string = ''; // Mensaje sobre el estado del juego

  constructor(private http: HttpClient) {}

  registerPlayer(name: string) {
    const formData = new FormData();
    formData.append('name', name);
  
    this.http.post<any>(`${this.APIUrl}/Player`, formData)
      .subscribe(response => {
        this.message = response.message;
        this.showWelcomeMessage = true;
  
        const newPlayer = { name: name, id: response.playerID };
  
        if (this.currentPlayer === 1) {
          this.player1 = newPlayer;
          this.currentPlayer = 2; // Pasamos al registro del jugador 2
        } else {
          this.player2 = newPlayer;
          // Aquí solo se inicia el juego si ambos jugadores han sido registrados
          this.isGameStarted = false; // Mantenemos esto como falso para no iniciar automáticamente
        }
      });
  }
  

  closeWelcomeMessage() {
    this.showWelcomeMessage = false;

    // Si se cierra el mensaje de bienvenida, permitimos registrar al segundo jugador
    if (this.currentPlayer === 2) {
      // Cambiamos el estado para permitir el registro del segundo jugador
      this.currentPlayer = 2; 
    }
  }

  resetGame() {
    // Reiniciar los jugadores y la lógica del juego
    this.player1 = null;
    this.player2 = null;
    this.currentPlayer = 1;
    this.isGameStarted = false; // Reiniciar el estado del juego
    this.showWelcomeMessage = false; // Ocultar el mensaje de bienvenida al reiniciar
    this.gameStartedMessage = ''; // Limpiar el mensaje del juego
  }

  startGame() {
    this.gameStartedMessage = ''; // Limpiar el mensaje al iniciar el juego

    if (this.player1 && this.player2) {
        const formData = new FormData();
        formData.append('player1ID', this.player1.id.toString());
        formData.append('player2ID', this.player2.id.toString());

        this.http.post<any>(`${this.APIUrl}/Game`, formData)
            .subscribe(response => {
                this.isGameStarted = true; // Cambia el estado a iniciado
                this.gameID = response.gameID; // Asumiendo que la respuesta incluye el ID del juego
                this.gameStartedMessage = ''; // Limpiar el mensaje después de iniciar el juego
            }, error => {
                this.gameStartedMessage = error.error.message;
            });
    } else {
        this.gameStartedMessage = "Debes registrar a ambos jugadores antes de iniciar el juego.";
    }
  }

  playRound() {
    if (this.currentTurn === 1) {
        // Jugador 1 seleccionando movimiento
        this.gameStartedMessage = "Jugador 1, elige tu movimiento.";
        return;
    } else if (this.currentTurn === 2) {
        // Jugador 2 seleccionando movimiento
        if (!this.gameID || !this.player1Move || !this.player2Move) {
            this.gameStartedMessage = "Debes seleccionar movimientos para ambos jugadores.";
            return;
        }

        const formData = new FormData();
        formData.append('gameID', this.gameID.toString());
        formData.append('player1Move', this.player1Move);
        formData.append('player2Move', this.player2Move);

        this.http.post<any>(`${this.APIUrl}/Round`, formData)
            .subscribe(response => {
                this.gameStartedMessage = response.message;
                this.currentTurn = 1; // Volver al turno del Jugador 1
            }, error => {
                this.gameStartedMessage = error.error.message;
            });
    }
  }

  selectPlayer1Move(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.player1Move = selectElement.value;
    this.currentTurn = 2; // Cambia al turno del Jugador 2
  }
}
