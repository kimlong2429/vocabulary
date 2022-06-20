import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { concatAll, delay, map, Observable, Subject, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { WordData, WordListService } from '../services/word-list.service';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent implements OnInit, OnDestroy {
  private WORDS_SIZE: number = 5
  displayedColumns: string[] = ['index', 'word', 'sounds'];
  dataSource!: MatTableDataSource<WordData>;

  words: WordData[] = []

  private randomStream: Subject<number> = new Subject()
  private subscription!: Subscription

  constructor(private wls: WordListService, private router: Router) { }

  ngOnInit(): void {
    if (!this.wls.selectedWords) {
      this.router.navigateByUrl('')
      return
    }

    this.dataSource = new MatTableDataSource(this.words)
    this.randomize()
  }

  private randomize() {
    let subject = this.dataSource.connect()

    this.subscription = this.randomStream.pipe(
      map(index => this.loadSoundOfText(index)),
      concatAll(),
      map(wd => this.renderRows(wd, subject)),
      delay(environment.wordInterval),
      map(wd => {
        let index = this.randomIndex()
        this.randomStream.next(index)
        return wd
      })
    ).subscribe({
      next: wd => console.log(wd)
    })

    // random first word
    let index = this.randomIndex()
    this.randomStream.next(index)
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }

    this.dataSource?.disconnect()
    this.randomStream.complete()
  }

  private randomIndex() {
    return Math.floor(Math.random()*this.wls.selectedWords.length)
  }

  private renderRows(wd: WordData, subject: Subject<WordData[]>): WordData {
    if (this.words.length == this.WORDS_SIZE) {
      this.words.shift()
    }

    this.words.push(wd)
    subject.next(this.words)

    return wd
  }

  private loadSoundOfText(index: number): Observable<WordData> {
    let wd = this.wls.selectedWords[index]
    return this.wls.soundOfText(wd.word).pipe(
      map(res => {
        if (res.success) {
          wd.soundUrl = this.wls.buildSoundUrl(res.id)
        }

        return wd
      })
    )
  }

  soundOfText(wd: WordData, audio: HTMLAudioElement) {
    if (wd.soundUrl) {
      audio.play()
      return
    }

    this.wls.soundOfText(wd.word).subscribe({
      next: res => {
        if (res.success) {
          wd.soundUrl = `https://storage.soundoftext.com/${res.id}.mp3`
          audio.crossOrigin = 'anonymous'

          setTimeout(() => {
            audio.play()
          }, 0);
        }
      }
    })
  }

  isLastRow(wb: WordData) {
    return this.words.indexOf(wb) == this.words.length - 1
  }
}
