:- module(proylcc,
	[
		put/8
	]).

:-use_module(library(lists)).


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% replace(?X, +XIndex, +Y, +Xs, -XsY)
%
% XsY es el resultado de reemplazar la ocurrencia de X en la posición XIndex de Xs por Y.

replace(X, 0, Y, [X|Xs], [Y|Xs]).

replace(X, XIndex, Y, [Xi|Xs], [Xi|XsY]):-
    XIndex > 0,
    XIndexS is XIndex - 1,
    replace(X, XIndexS, Y, Xs, XsY).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% put(+Contenido, +Pos, +PistasFilas, +PistasColumnas, +Grilla, -GrillaRes, -FilaSat, -ColSat).
%

put(Contenido, [RowN, ColN], PistasFilas, PistasColumnas, Grilla, NewGrilla, FilaSat, ColSat):-
	% NewGrilla es el resultado de reemplazar la fila Row en la posición RowN de Grilla
	% (RowN-ésima fila de Grilla), por una fila nueva NewRow.

	replace(Row, RowN, NewRow, Grilla, NewGrilla),

	% NewRow es el resultado de reemplazar la celda Cell en la posición ColN de Row por _,
	% siempre y cuando Cell coincida con Contenido (Cell se instancia en la llamada al replace/5).
	% En caso contrario (;)
	% NewRow es el resultado de reemplazar lo que se que haya (_Cell) en la posición ColN de Row por Conenido.

	(replace(Cell, ColN, _, Row, NewRow),
	Cell == Contenido
		;
	replace(_Cell, ColN, Contenido, Row, NewRow)),


    recuperar_lista(RowN, PistasFilas, ListaPistasFila), 
    recuperar_lista(RowN, NewGrilla, ListaFila),

    (FilaSat is 1,
    verificar_pistas_con_linea(ListaPistasFila, ListaFila)          % se verifica si la fila recuperada cumple con las pistas
            ;
    FilaSat is 0),

	recuperar_lista(ColN, PistasColumnas, ListaPistasColumnas),
	recuperar_columna(ColN, NewGrilla, ListaColumna),

	(ColSat is 1,
    verificar_pistas_con_linea(ListaPistasColumnas, ListaColumna)   % se verifica si la columna recuperada cumple con las pistas
		;
    ColSat is 0).


% Recupera la lista en la posición N dentro de una lista de listas.

recuperar_lista(0, [X|_Xs], X).
recuperar_lista(N, [_X|Xs], Return):-
    N > 0,
    Aux is N - 1,
    recuperar_lista(Aux, Xs, Return).


% Determina si una lista cumple con sus pistas asociadas.
% El primer parámetro será una lista de pistas, y el segundo será una lista (línea) a verificar.

verificar_pistas_con_linea([],[]).
verificar_pistas_con_linea([], L):-                %si la lista de pistas esta vacia, verifico que no haya ningún "#".
    not(pertenece("#", L)).			            
verificar_pistas_con_linea([X], L):-
    n_consecutivos(X, X, L, ListaResultante),          %si tengo un solo elemento en la lista de pistas y encuentro N "#" consecutivos, 
    not(pertenece("#", ListaResultante)).	           %me fijo que no haya ningun otro	"#"
verificar_pistas_con_linea([X|Xs], L):-		
    n_consecutivos(X, X, L, Lista_sin_N_consecutivos),
    verificar_pistas_con_linea(Xs, Lista_sin_N_consecutivos).


% Determina si hay N elementos "#" consecutivos dentro de una lista
% y devuelve la lista resultante de eliminar los N "#" consecutivos
% y todos sus elementos predecesores.
% Si no hay N elementos "#" consecutivos, retorna falso.

n_consecutivos(0, _Ninicial, [], []).
n_consecutivos(0, _Ninicial, [X|Xs], [X|Xs]):-
    not(X == "#").                       %luego de encontrar N consecutivos, verifico que el siguiente no sea un "#"
n_consecutivos(N, Ninicial, [E|Xs], R):-
    N > 0,
    E == "#",
    Cant is N - 1,
    n_consecutivos(Cant, Ninicial, Xs, R).
n_consecutivos(N, Ninicial, [E|Xs], R):-
    N > 0,
    not(E == "#"),
    0 is N - Ninicial,                   %si (N-Ninicial no es cero), quiere decir que encontramos un "#" y luego un elemento distinto 
    n_consecutivos(N, Ninicial, Xs, R).  % a un "#", por lo que no hay N consecutivos


% Recupera todos los elementos correspondientes a una columna en la posición N
% y los retorna en forma de lista.

recuperar_columna(N, [X], [ElementoObtenido]):-
    recuperar_lista(N, X, ElementoObtenido).
recuperar_columna(N, [X|Xs], ColumnaRetorno):-
    recuperar_lista(N, X, Elemento),
    recuperar_columna(N, Xs, ColumnaRetornoAux),
    ColumnaRetorno = [Elemento|ColumnaRetornoAux].


% Determina si un elemento E pertenece a una lista.

pertenece(E, [X|_Xs]):-
    E == X.
pertenece(E, [X|Xs]):-
    E == X,
    pertenece(E, Xs).
pertenece(E, [X|Xs]):-
    E \== X,
    pertenece(E, Xs).




% Verificacion del estado inicial de la grilla.

verificacion_al_comenzar(Grilla, PistasFilas, PistasColumnas, ListaFilasQueCumplen, ListaColumnasQueCumplen):-
    %GrillaAux = Grilla,    %lo dejo comentado por las dudas si se rompe
    %GrillaAux2 = Grilla,
    longitud(Grilla, TotalFilas),           %Determina el total de filas de la grilla.
    TotalFilasAux is TotalFilas - 1,        %Se resta 1 al total de filas para que recorra de 0 a N.
    verificar_fila_al_comenzar(TotalFilasAux, Grilla, PistasFilas, ListaFilasQueCumplen),
    total_columnas(Grilla, TotalColumnas),
    Aux is TotalColumnas - 1,               %Se resta 1 al total de columnas para que recorra de 0 a N.
    verificar_columna_al_comenzar(Aux, Grilla, PistasColumnas, ListaColumnasQueCumplen).


% Inserta en una lista que retorna, los índices de las filas que se encuentran satisfechas.

verificar_fila_al_comenzar(-1, _Grilla, _ListaPistas, []).
verificar_fila_al_comenzar(N, Grilla, ListaPistas, ListaFilasQueCumplen):-

    recuperar_lista(N, ListaPistas, ListaPistasRecuperada),
    recuperar_lista(N, Grilla, LineaRecuperada),

    (ListaFilasQueCumplen = [N|ListaAux],
    verificar_pistas_con_linea(ListaPistasRecuperada, LineaRecuperada)
    	;   
    ListaFilasQueCumplen = ListaAux),
    
    Aux is N - 1,
    verificar_fila_al_comenzar(Aux, Grilla, ListaPistas, ListaAux).


% Inserta en una lista que retorna, los índices de las columnas que se encuentran satisfechas.

verificar_columna_al_comenzar(-1, _Grilla, _ListaColumnas, []).
verificar_columna_al_comenzar(N, Grilla, ListaColumnas, ListaColumnasQueCumplen):-
    
    recuperar_lista(N, ListaColumnas, ListaPistasRecuperada),
	recuperar_columna(N, Grilla, Columna),
	
    (ListaColumnasQueCumplen = [N|ListaAux],
    verificar_pistas_con_linea(ListaPistasRecuperada, Columna)
    	;   
    ListaColumnasQueCumplen = ListaAux),
    
    Aux is N - 1,
    verificar_columna_al_comenzar(Aux, Grilla, ListaColumnas, ListaAux).


% Determina la longitud de una lista.

longitud([],0).
longitud([_X|Sublista],R):-
	longitud(Sublista,Raux),
	R is Raux + 1.


% Devuelve el total de columnas de una grilla, obteniendo la longitud de la primer fila de la grilla.
total_columnas([], 0).
total_columnas([X|_Xs], Return):-
    longitud(X, Return).