export enum UiEvents {
    ButtonRestartClicked = "ButtonRestartClicked",
    ButtonUndoClicked = "ButtonUndoClicked",
    NewGameSettingsSubmitted = "NewGameSettingsSubmitted", // sending new game form data
    EndGameClosed = "EndGameClosed", // sending one of EndGameClosedActions
}

export enum EndGameClosedActions {
    Replay = "Replay",
    NewGame = "New game",
}

export enum GameEvents {
    TwoTubesChoosen = "TwoTubesChoosen", // GV -> Level, 2 numbers: source and recipient tube nums
    MoveFailed = "MoveFailed", // Level -> GV
    MoveSucceeded = "MoveSucceeded", // Level -> GV & MS
    SourceTubeChoosen = "SourceTubeChoosen",
}

export enum ViewEvents {
    TubeClicked = "TubeClicked", // TubeView -> GV
    PortionAnimationFinished = "PortionAnimationFinished", // PortionView -> GV
}
