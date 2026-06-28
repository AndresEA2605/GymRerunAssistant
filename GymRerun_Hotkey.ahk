#NoEnv
SetTitleMatchMode, 2

; ----------------------------------------------------
; PokeMMO Gym Rerun Assistant - Auto Checker Hotkey
; Presiona F4 para marcar el siguiente paso en la guia
; ----------------------------------------------------

F4::
    ; Guarda que ventana esta activa actualmente (el juego)
    WinGet, active_id, ID, A
    
    ; Busca la ventana de la guia
    IfWinExist, PokeMMO Gym Rerun Assistant
    {
        ; Activa la guia, envia espacio y vuelve rapidamente al juego
        WinActivate
        WinWaitActive, PokeMMO Gym Rerun Assistant, , 2
        Send, {Space}
        
        ; Regresa al juego inmediatamente
        WinActivate, ahk_id %active_id%
    }
    else
    {
        MsgBox, 48, Error, No se encontro la ventana "PokeMMO Gym Rerun Assistant". Por favor, abre la aplicacion en tu navegador.
    }
return
