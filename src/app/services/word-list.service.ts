import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WordListService {
  words: string[] = []
  wordDataList: WordData[] = []

  constructor(private http: HttpClient) { }

  loadWordList(url: string): Observable<string[]> {
    return this.http.get<string[]>(url).pipe(
      tap(res => {
        this.words = res
      })
    )
  }

  soundOfText(word: string): Observable<SoundOfTextResponse> {
    return this.http.post<SoundOfTextResponse>('https://api.soundoftext.com/sounds',
      {
        engine: "Google",
        data: {
          text: word,
          voice: "en-US"
        }
      })
  }
}

export interface SoundOfTextResponse {
  success: boolean
  id: string
}

export interface WordData {
  index: number
  word: string
  soundUrl?: string
}
