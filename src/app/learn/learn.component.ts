import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { WordData, WordListService } from '../services/word-list.service';

@Component({
  selector: 'app-learn',
  templateUrl: './learn.component.html',
  styleUrls: ['./learn.component.scss']
})
export class LearnComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['index', 'word', 'sounds'];
  dataSource!: MatTableDataSource<WordData>;

  words: WordData[] = []

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private wls: WordListService, private router: Router) { }

  ngOnInit(): void {
    if (!this.wls.selectedWords) {
      this.router.navigateByUrl('')
      return
    }

    this.words = this.wls.selectedWords
    this.dataSource = new MatTableDataSource(this.words)
  }

  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  applyFilter(event: any) {
    let filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  soundOfText(wd: WordData, audio: HTMLAudioElement) {
    if (wd.soundUrl) {
      audio.play()
      return
    }

    this.wls.soundOfText(wd.word).subscribe({
      next: res => {
        if (res.success) {
          wd.soundUrl = this.wls.buildSoundUrl(res.id)

          setTimeout(() => {
            audio.play()
          }, 0);
        }
      }
    })
  }

  async onClickReview() {
    await this.router.navigateByUrl('/review')
  }


}
