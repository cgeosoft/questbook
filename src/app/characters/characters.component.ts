import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DatabaseService } from '../_shared/services/database.service';
import { BaseModel, Character, CharacterData, DocType } from '../_shared/services/models.all';
import { StateService } from '../_shared/services/state.service';
import { CharacterFormComponent } from './character-form/character-form.component';

@Component({
  selector: 'app-characters',
  templateUrl: './characters.component.html',
})
export class CharactersComponent implements OnInit {
  characters$: Observable<(Character)[]>;
  campaign$: any;

  constructor(
    private state: StateService,
    private modalCtrl: ModalController,
    private db: DatabaseService,
  ) { }

  async ngOnInit() {
    this.campaign$ = this.state.campaign$;
    this.characters$ = this.db
      .getCollection<CharacterData>(DocType.character)
      .pipe(
        tap(characters => characters.sort((a, b) => {
          return b.visible - a.visible;
        })),
        map(characters => {
          return characters as Character[];
        })
      );
  }

  getRef(i, q: BaseModel) {
    return q.ref;
  }

  async create() {
    const modal = await this.modalCtrl.create({
      component: CharacterFormComponent
    });
    await modal.present();
  }
}

@Pipe({
  name: 'visible',
  pure: false
})
export class VisiblePipe implements PipeTransform {
  constructor(private state: StateService) { }

  transform(items: any[]): any {
    if (!items) {
      return items;
    }

    return items.filter(item => item.visible || this.state.campaign$.value.isMaster);
  }
}
